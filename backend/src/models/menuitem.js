'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MenuItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.MenuItem.hasMany(models.OrderItem, { foreignKey: 'menu_item_id' });
    }
  }
  MenuItem.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    category: DataTypes.STRING,
    image_url: DataTypes.STRING,
    is_available: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MenuItem',
  });
  return MenuItem;
};