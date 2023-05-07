'use strict';

var crypt = require('../helpers/crypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {

    return queryInterface.bulkInsert('users', [
        {
            username: 'admin',
            password: crypt.encryptPassword('1234', 'aaaa'),
            email: "admin@core.example",
            salt: 'aaaa',
            isAdmin: true,
            createdAt: new Date(), updatedAt: new Date()
        },
        {
            username: 'pepe',
            password: crypt.encryptPassword('5678', 'bbbb'),
            email: "pepe@core.example",
            salt: 'bbbb',
            createdAt: new Date(), updatedAt: new Date()
        }
    ]);
  },

  down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};