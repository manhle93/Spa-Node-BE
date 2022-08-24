'use strict';
const {
  Model
} = require('sequelize');
const PROTECTED_ATTRIBUTES = ['password', 'tokens']
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    toJSON () {
      // hide protected fields
      let attributes = Object.assign({}, this.get())
      for (let a of PROTECTED_ATTRIBUTES) {
        delete attributes[a]
      }
      return attributes
    }

    static associate(models) {
      User.belongsTo(models.Role, {  //Ten model
        foreignKey: 'roleId', //ten khoa ngoai
        as: 'role' // ten file model
      });
    }
  };
  User.init(
  {
    name: DataTypes.STRING,
    userName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    urlImage: DataTypes.STRING,
    tokens: DataTypes.JSON,
    roleId: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  }, 
  {
    sequelize,
    modelName: 'User',
  },
  );
  sequelizePaginate.paginate(User);
  return User;
};