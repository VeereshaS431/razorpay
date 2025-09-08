const sequelize = require("../../config/database")
const { DataTypes } = require("sequelize")

const Chat = sequelize.define("Chat", {
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    AdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

module.exports = Chat