'use strict';
const {Model} = require('sequelize');
const { nanoid } = require('nanoid');
module.exports = (sequelize, DataTypes) => {
  class Ingredient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Ingredient.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => nanoid(10) // 10 karakter id
    },
    name: DataTypes.STRING(50)
  }, {
    sequelize,
    modelName: 'Ingredient',
  });
  return Ingredient;
};