'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
        'Posts',
        'authorId',
        {
            type: Sequelize.INTEGER,
            references: {
                model: "Users",
                key: "id"
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Posts', 'authorId');
  }
};
