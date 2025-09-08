// apis/routes/message.routes.js
const express = require("express");
const router = express.Router();
const { checkUser } = require("../../middlewares/checkUser");
const ConversationParticipant = require("../models/conversationParticipant.model");
const Message = require("../models/message.model");

// Send a message
router.post("/", checkUser, async (req, res) => {
    const { conversationId, content } = req.body;
    const me = req.user.id;
    const io = req.io;
    const participant = await ConversationParticipant.findOne({ where: { conversationId, userId: me } });
    if (!participant) return res.status(403).json({ error: "Not a member" });

    const message = await Message.create({ conversationId, senderId: me, text: content });
    console.log(conversationId.toString(), "conversationId from message route");
    // Emit to all participants in the room
    // io.to(`${conversationId.toString()}`).emit("newMessage", message);
    io.to(`${conversationId.toString()}`).emit("newMessage", message);
    res.json(message);
});



// Get messages (paginated)
router.get("/:conversationId", checkUser, async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const me = req.user.id;

    const participant = await ConversationParticipant.findOne({ where: { conversationId, userId: me } });
    if (!participant) return res.status(403).json({ error: "Not a member" });

    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
        where: { conversationId },
        order: [["createdAt", "DESC"]],
        limit: Number(limit),
        offset: Number(offset),
    });

    res.json({
        page: Number(page),
        totalPages: Math.ceil(count / limit),
        messages: rows.reverse(),
    });
});

module.exports = router;
