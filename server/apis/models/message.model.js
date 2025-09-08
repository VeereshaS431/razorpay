const sequelize = require("../../config/database")
const { DataTypes } = require("sequelize")

const Message = sequelize.define("Message", {
    conversationId: { type: DataTypes.INTEGER, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT },
    attachments: { type: DataTypes.JSON },
    editedAt: { type: DataTypes.DATE },
    deletedAt: { type: DataTypes.DATE },
})

module.exports = Message