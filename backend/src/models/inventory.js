'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Inventory.belongsTo(models.Branch, { foreignKey: 'branch_id' });
    }
  }
  Inventory.init({
    branch_id: DataTypes.INTEGER,
    item_name: DataTypes.STRING,
    unit: DataTypes.STRING,
    quantity: DataTypes.DECIMAL,
    min_quantity: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Inventory',
  });
  return Inventory;
};