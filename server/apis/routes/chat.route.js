const express = require("express")
const router = express.Router()
const chatController = require("../controllers/chat.controller")

router.post("/sendMessage", chatController.createChat);
router.get("/getMessages", chatController.getChat);

module.exports = router