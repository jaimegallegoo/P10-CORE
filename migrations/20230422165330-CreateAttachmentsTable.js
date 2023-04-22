'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      'Attachments',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true
        },
        mime: {
          type: Sequelize.STRING
        },
        url: {
          type: Sequelize.STRING
        },
        image: {
          type: Sequelize.BLOB('long')
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      },
      {
        sync: {force: true}
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Attachments');
  }
};
