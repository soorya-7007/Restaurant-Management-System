'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Branch extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Branch.hasMany(models.User, { foreignKey: 'branch_id' });
      models.Branch.hasMany(models.Inventory, { foreignKey: 'branch_id' });
      models.Branch.hasMany(models.Order, { foreignKey: 'branch_id' });
    }
  }
  Branch.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Branch',
  });
  return Branch;
};