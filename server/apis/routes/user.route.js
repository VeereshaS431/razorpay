const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const { checkUser, isAdmin } = require("../../middlewares/checkUser")
const upload = require("../../config/upload")

router.post("/createAdmin", userController.createUser)
router.post("/createUser", checkUser, isAdmin, userController.createUser)
router.post("/login", userController.loginUser)
router.put("/update/:id", checkUser, upload.single("profileImage"), userController.updateUser)
router.get("/getAllUsers",  userController.getAllUsers)

module.exports = router