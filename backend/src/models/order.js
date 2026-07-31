'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Order.belongsTo(models.Branch, { foreignKey: 'branch_id' });
      models.Order.belongsTo(models.User, { as: 'waiter', foreignKey: 'user_id' });
      models.Order.belongsTo(models.User, { as: 'chef', foreignKey: 'chef_id' });
      models.Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
    }
  }
  Order.init({
    branch_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    chef_id: DataTypes.INTEGER,
    table_number: DataTypes.STRING,
    status: DataTypes.STRING,
    total_amount: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};