const sequelize = require("../../config/database")
const { DataTypes } = require("sequelize")

const Users = sequelize.define("Users", {
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

module.exports = Users