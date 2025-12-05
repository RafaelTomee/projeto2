// Este arquivo deve estar na pasta /seeders
const bcrypt = require('bcrypt');

const DEFAULT_PASSWORD = '123456'; 
const hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Users', [{
      email: 'admin@hotel.com', 
      password: hashedPassword,
      role: 'admin', 
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {
      email: 'admin@hotel.com'
    }, {});
  }
};