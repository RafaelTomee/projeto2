// Este arquivo deve estar na pasta /seeders
const bcrypt = require('bcrypt');

// Defina a senha que você deseja usar para o admin
const DEFAULT_PASSWORD = '123456'; 
const hashedPassword = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insere o usuário administrador
    await queryInterface.bulkInsert('Users', [{
      // ATENÇÃO: Verifique se o nome da sua tabela de usuários é 'Users' (com 's')
      email: 'admin@hotel.com', 
      password: hashedPassword,
      role: 'admin', // Assumindo que você tem um campo 'role' (perfil)
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Comando para deletar o registro se precisar reverter (rollback)
    await queryInterface.bulkDelete('Users', {
      email: 'admin@hotel.com'
    }, {});
  }
};