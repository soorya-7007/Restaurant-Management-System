'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('Users', [
      {
        name: 'Alice Admin',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'Admin',
        branch_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bob Chef',
        email: 'chef@demo.com',
        password: hashedPassword,
        role: 'Chef',
        branch_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Charlie Waiter',
        email: 'waiter@demo.com',
        password: hashedPassword,
        role: 'Waiter',
        branch_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
