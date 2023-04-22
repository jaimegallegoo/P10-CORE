'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      'Posts',
      {
          id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              autoIncrement: true,
              unique: true
          },
          title: {
              type: Sequelize.STRING,
              validate: {notEmpty: {msg: "title must not be empty."}}
          },
          body: {
              type: Sequelize.TEXT,
              validate: {notEmpty: {msg: "body must not be empty."}}
          },
          attachmentId: {
            type: Sequelize.STRING,
            references: {
              model: "Attachments",
              key: "id"
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
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
    await queryInterface.dropTable('Posts');
  }
};
