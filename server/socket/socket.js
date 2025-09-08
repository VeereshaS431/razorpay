// socket.js
// const { ConversationParticipant, Message } = require("./apis/models");

const ConversationParticipant = require("../apis/models/conversationParticipant.model");
const Message = require("../apis/models/message.model");


module.exports = (io) => {
    io.on("connection", (socket) => {
        const { userId } = socket.handshake.query;

        if (userId) {
            socket.join(userId.toString()); // personal room
            console.log(`User ${userId} connected: ${socket.id}`);
        } else {
            console.warn(`Socket connection without userId: ${socket.id}`);
        }

        // =====================
        // PAGINATED MESSAGES
        // =====================
        socket.on("loadMessages", async ({ conversationId, page = 1, limit = 20 }) => {
            try {
                // Verify user is part of the conversation
                const participant = await ConversationParticipant.findOne({
                    where: { conversationId, userId },
                });

                if (!participant) {
                    socket.emit("error", { message: "Not authorized to view this conversation" });
                    return;
                }

                // Fetch messages with pagination (newest first)
                const offset = (page - 1) * limit;

                const { count, rows } = await Message.findAndCountAll({
                    where: { conversationId },
                    order: [["createdAt", "DESC"]],
                    limit,
                    offset,
                });

                socket.emit("messagesPage", {
                    conversationId,
                    page,
                    totalPages: Math.ceil(count / limit),
                    messages: rows,
                });
            } catch (err) {
                console.error("Error loading messages:", err);
                socket.emit("error", { message: "Failed to load messages" });
            }
        });


        // =====================
        // JOIN CONVERSATION
        // =====================
        socket.on("joinConversation", async ({ conversationId }) => {
            try {
                const participant = await ConversationParticipant.findOne({
                    where: { conversationId, userId },
                });
                console.log(participant, "participant from join convo socket");
                if (!participant) {
                    console.warn(`User ${userId} tried to join conversation ${conversationId} but is not a member`);
                    return;
                }
                if (conversationId) {
                    socket.join(conversationId.toString());
                    // socket.join(`10`);
                    console.log(`User ${userId} joined conversation ${conversationId}`);
                }

            } catch (err) {
                console.error("Error joining conversation:", err);
            }
        });

        // =====================
        // SEND MESSAGE
        // =====================
        socket.on("sendMessage", async ({ conversationId, content }) => {
            try {
                const participant = await ConversationParticipant.findOne({
                    where: { conversationId, userId },
                });

                if (!participant) {
                    console.warn(`User ${userId} tried to send message to conversation ${conversationId} but is not a member`);
                    return;
                }

                // const newMessage = await Message.create({
                //     conversationId,
                //     senderId: userId,
                //     content,
                // });

                // io.to(conversationId.toString()).emit("newMessage", newMessage);
            } catch (err) {
                console.error("Error sending message:", err);
            }
        });

        // =====================
        // TYPING
        // =====================
        socket.on("typing", ({ conversationId }) => {
            socket.to(conversationId.toString()).emit("typing", { userId });
        });

        socket.on("stopTyping", ({ conversationId }) => {
            socket.to(conversationId.toString()).emit("stopTyping", { userId });
        });

        // =====================
        // READ RECEIPT
        // =====================
        socket.on("readMessage", async ({ messageId }) => {
            try {
                await Message.update(
                    { status: "read" },
                    { where: { id: messageId } }
                );
                io.to(userId.toString()).emit("messageRead", { messageId, userId });
            } catch (err) {
                console.error("Error marking message as read:", err);
            }
        });

        // =====================
        // DISCONNECT
        // =====================
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
