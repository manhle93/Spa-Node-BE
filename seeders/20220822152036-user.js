'use strict';
var bcrypt = require("bcryptjs");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     await queryInterface.bulkInsert('Users', [{
        name: 'Administrator',
        userName: 'admin',
        email: 'admin@email.com',
        password: bcrypt.hashSync('12345678', 10),
        roleId: 1,
        active: true,
        createdAt: new Date(),
        updatedAt:  new Date(),
      }], {});

  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
