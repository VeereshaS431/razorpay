const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const ConversationParticipant = sequelize.define("ConversationParticipant", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        // unique: true,
        primaryKey: true,
    },
    conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("member", "admin", "owner"),
        defaultValue: "member",
    },
    lastReadAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = ConversationParticipant;