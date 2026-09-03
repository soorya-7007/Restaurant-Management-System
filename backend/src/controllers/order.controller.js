const { Order, OrderItem, MenuItem, Inventory, sequelize } = require('../models');

// Orders are sent to the KDS with their items and each item's menu entry, so
// the kitchen sees dish names instead of raw menu_item_id values.
const ORDER_INCLUDE = [
  {
    model: OrderItem,
    include: [{ model: MenuItem, attributes: ['id', 'name', 'category'] }],
  },
];

const createOrder = async (req, res) => {
  const { branch_id, items, total_amount, table_number } = req.body;
  const user_id = req.user ? req.user.id : null; // Strictly use authenticated user_id as Waiter

  try {
    // Start a managed transaction
    const result = await sequelize.transaction(async (t) => {
      // 1. Create the Order
      const order = await Order.create({
        branch_id,
        user_id,
        table_number,
        status: 'New',
        total_amount
      }, { transaction: t });

      // 2. Create the Order Items
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || null
      }));
      await OrderItem.bulkCreate(orderItemsData, { transaction: t });

      // 3. Auto-Stock Deduction (Simplified for demo)
      // In a real scenario, this would use a Recipe mapping table.
      // Here we just simulate reducing generic inventory.
      for (const item of items) {
        // Find an inventory item to deduct (e.g., matching name or a generic "Stock")
        const invItem = await Inventory.findOne({ 
          where: { branch_id },
          transaction: t
        });

        if (invItem && invItem.quantity >= item.quantity) {
          await invItem.update({
            quantity: invItem.quantity - item.quantity
          }, { transaction: t });
        }
      }

      return order;
    });

    // Emit Socket.io event for KDS. Re-read with the items included so a live
    // ticket carries the same shape as one fetched via GET /api/orders —
    // previously the bare Order was emitted and arrived with no line items.
    const io = req.app.get('io');
    if (io) {
      const fullOrder = await Order.findByPk(result.id, { include: ORDER_INCLUDE });
      io.to('kitchen').emit('newOrder', fullOrder || result);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: ORDER_INCLUDE,
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const chef_id = req.user ? req.user.id : null; // Track Chef

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await order.update({ status, chef_id });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to('kitchen').emit('orderUpdated', order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: ORDER_INCLUDE,
    });
    const inventory = await Inventory.findAll();

    let totalRevenue = 0;
    let ordersToday = 0;
    const activeCustomersSet = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const revenueByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const itemSales = {};

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      totalRevenue += parseFloat(order.total_amount) || 0;
      
      // Orders today
      if (orderDate >= today) {
        ordersToday++;
        if (order.table_number) {
          activeCustomersSet.add(order.table_number);
        }
      }

      // Weekly revenue (simple bucket by day of week)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = days[orderDate.getDay()];
      revenueByDay[dayName] += parseFloat(order.total_amount) || 0;

      // Item sales
      if (order.OrderItems) {
        order.OrderItems.forEach(oi => {
          if (oi.MenuItem) {
            const name = oi.MenuItem.name;
            itemSales[name] = (itemSales[name] || 0) + oi.quantity;
          }
        });
      }
    });

    const revenueData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      name: day,
      revenue: revenueByDay[day]
    }));

    const itemData = Object.keys(itemSales)
      .map(name => ({ name, sales: itemSales[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);

    const lowStockCount = inventory.filter(item => parseFloat(item.quantity) <= parseFloat(item.min_quantity)).length;

    res.json({
      totalRevenue,
      ordersToday,
      activeCustomers: activeCustomersSet.size,
      lowStockCount,
      revenueData,
      itemData
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus, getAnalytics };
