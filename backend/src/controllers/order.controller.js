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

module.exports = { createOrder, getOrders, updateOrderStatus };
