const Users = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const createUser = async (req, res) => {
    try {
        const { email, password, phone, role } = req.body

        const user = await Users.findOne({ where: { email } });
        if (user) return res.status(409).json({ message: "email already exists" })
        const verifyPhone = await Users.findOne({ where: { phone } })
        if (verifyPhone) return res.status(409).json({ message: "phone number already exists" })
        const hasedPassword = await bcrypt.hash(password, 10)

        const createdUser = await Users.create({
            email,
            password: hasedPassword,
            phone,
            role
        })

        res.json({ message: "user created successfully", createdUser })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await Users.findOne({ where: { email } })
        if (!user) return res.status(400).json({ message: "invalid credentials" })
        if (!user.isActive) return res.status(400).json({ message: "user is Inactive" })
        const varifyPassword = await bcrypt.compare(password, user.password)
        console.log(varifyPassword, "password varification")
        if (!varifyPassword) return res.status(400).json({ message: "Invalid Password" })

        const token = {
            id: user.id,
            role: user.role
        }

        const jwtToken = jwt.sign(token, process.env.JWT_KEY, {
            expiresIn: "1d"
        })

        res.json({ message: "Login Successfuly", jwtToken })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params
    const { isActive } = req.body
    try {
        const user = await Users.findByPk(id)
        if (!user) return res.status(404).json({ message: "User not found" })
        if (req.file) {
            user.profileImage = req.file.filename
        }

        user.isActive = isActive

        const updatedUser = await user.save()

        res.json({ message: "User updated successfully", updatedUser })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll();
        res.json({ users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    getAllUsers
}