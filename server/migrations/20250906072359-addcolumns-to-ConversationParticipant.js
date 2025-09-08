'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // await queryInterface.addColumn('conversationparticipants', 'id', { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true });
    await queryInterface.addColumn('conversationparticipants', 'role', { type: Sequelize.ENUM("member", "admin", "owner"), defaultValue: "member", })
    await queryInterface.addColumn('conversationparticipants', 'lastReadAt', { type: Sequelize.DATE, allowNull: true, })
    await queryInterface.addColumn('conversationparticipants', 'joinedAt', { type: Sequelize.DATE, defaultValue: Sequelize.NOW })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // await queryInterface.removeColumn('conversationparticipants', 'id')
    await queryInterface.removeColumn('conversationparticipants', 'role')
    await queryInterface.removeColumn('conversationparticipants', 'lastReadAt')
    await queryInterface.removeColumn('conversationparticipants', 'joinedAt')
  }
};
