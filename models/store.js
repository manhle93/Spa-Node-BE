'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Store.init({
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    email: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    note: DataTypes.STRING,
    openTime: DataTypes.TIME,
    closeTime: DataTypes.TIME,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    provinceId: DataTypes.INTEGER,
    information: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Store',
  });
  sequelizePaginate.paginate(Store);
  return Store;
};