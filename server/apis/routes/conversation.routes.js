// apis/routes/conversation.routes.js
const express = require("express");
const router = express.Router();

const { checkUser } = require("../../middlewares/checkUser");
const Conversation = require("../models/conversation.model");
const ConversationParticipant = require("../models/conversationParticipant.model");
const Users = require("../models/user.model");
const Message = require("../models/message.model");

// Create a one-to-one DM (idempotent)
router.post("/dm", checkUser, async (req, res) => {
    const { peerId } = req.body;
    const me = req.user.id;

    if (me === peerId) return res.status(400).json({ error: "Cannot DM yourself" });

    // Check if DM exists
    const existing = await Conversation.findOne({
        include: [{
            model: Users,
            where: { id: [me, peerId] },
            through: { attributes: [] }
        }],
        where: { type: "dm" },
    });

    if (existing) return res.json(existing);

    // Create DM conversation
    const convo = await Conversation.create({ type: "dm" });
    await ConversationParticipant.bulkCreate([
        { conversationId: convo.id, userId: me, role: "member" },
        { conversationId: convo.id, userId: peerId, role: "member" },
    ]);

    const conversation = await Conversation.findByPk(convo.id, {
        include: { model: Users, attributes: ["id", "Name"], through: { attributes: ["role"] } }
    });

    res.json(conversation);
});

// Create a group
router.post("/group", checkUser, async (req, res) => {
    const { title, memberIds = [] } = req.body;
    const me = req.user.id;
    console.log(memberIds, "memberIds", title);
    const convo = await Conversation.create({ type: "group", title });

    // Add participants (owner + members)
    await ConversationParticipant.bulkCreate([
        { conversationId: convo.id, userId: me, role: "owner" },
        ...memberIds.map(id => ({ conversationId: convo.id, userId: id, role: "member" }))
    ]);

    const group = await Conversation.findByPk(convo.id, {
        include: { model: Users, attributes: ["id", "Name"], through: { attributes: ["role"] } }
    });

    res.json(group);
});


// Get all my conversations
router.get("/", checkUser, async (req, res) => {
    try {
        const me = req.user.id;
        const { userId } = req.query; // if passed, get DM with that user only

        const whereClause = userId
            ? { // DM: find conversation where both me and userId exist
                [Op.and]: [
                    { "$Users.id$": me },
                    { "$OtherUsers.id$": userId }
                ]
            }
            : { "$Users.id$": me };

        const convos = await Conversation.findAll({
            include: [
                {
                    model: Users,
                    as: "Users",
                    attributes: ["id", "Name"],
                    through: { attributes: ["role"] },
                    where: whereClause
                },
                {
                    model: Users,
                    as: "OtherUsers",
                    attributes: ["id", "Name"],
                    through: { attributes: [] }
                },
                {
                    model: Message,
                    limit: 1,
                    order: [["createdAt", "DESC"]],
                }
            ],
            order: [["updatedAt", "DESC"]],
            where: userId ? undefined : {}, // only apply where if DM
        });

        res.json(convos);
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// Add/remove group members
router.post("/:id/members", checkUser, async (req, res) => {
    const { id } = req.params;
    const { add = [], remove = [] } = req.body;
    const me = req.user.id;

    const convo = await Conversation.findByPk(id, {
        include: { model: ConversationParticipant }
    });

    if (!convo || convo.type !== "group") return res.status(404).json({ error: "Group not found" });

    const meParticipant = await ConversationParticipant.findOne({
        where: { conversationId: id, userId: me }
    });

    if (!meParticipant || !["admin", "owner"].includes(meParticipant.role))
        return res.status(403).json({ error: "Forbidden" });

    // Add members
    for (const uid of add) {
        const exists = await ConversationParticipant.findOne({ where: { conversationId: id, userId: uid } });
        if (!exists) await ConversationParticipant.create({ conversationId: id, userId: uid, role: "member" });
    }

    // Remove members
    await ConversationParticipant.destroy({ where: { conversationId: id, userId: remove } });

    const updated = await Conversation.findByPk(id, {
        include: { model: Users, attributes: ["id", "username"], through: { attributes: ["role"] } }
    });

    res.json(updated);
});

module.exports = router;
