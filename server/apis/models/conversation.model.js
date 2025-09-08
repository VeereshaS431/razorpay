const sequelize = require("../../config/database")
const { DataTypes } = require("sequelize")

const Conversation = sequelize.define("Conversation", {
    type: { type: DataTypes.ENUM('dm', 'group'), allowNull: false },
    title: { type: DataTypes.STRING },
    createdBy: { type: DataTypes.INTEGER },
    dmKey: { type: DataTypes.STRING, unique: true },
    lastMessageAt: { type: DataTypes.DATE },
})

module.exports = Conversation