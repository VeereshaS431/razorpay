const jwt = require("jsonwebtoken")
const Users = require("../apis/models/user.model")

const checkUser = async (req, res, next) => {
    try {
        console.log(req.headers.authorization, "headeToken")
        const token = req.headers.authorization.split(" ")[1]
        if (!token) {
            return res.status(401).json({ message: "unauthorized" })
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const user = await Users.findByPk(decoded.id)
        console.log(user, "form user")
        if (!user) {
            return res.status(401).json({ message: "Invalid user" })
        }
        if (!user.isActive) return res.status(401).json({ message: "inactive user" })
        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ message: "unauthorized" })
    }
}


const isAdmin = (req, res, next) => {
    console.log(req.user.role, "isAdmin")
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "only admin can perform this action" });
    }
    next();
};


module.exports = { checkUser, isAdmin };