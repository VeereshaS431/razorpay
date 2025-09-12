const User = require("../models/user.model")
const Chat = require("../models/chat.model");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const ConversationParticipant = require("../models/conversationParticipant.model");
// const sequelize = require("../../config/database")

const defineAssociation = () => {
    User.hasMany(Chat, { foreignKey: "userId" });
    Chat.belongsTo(User, { foreignKey: "userId" });

    User.hasMany(Chat, { foreignKey: "AdminId" });
    Chat.belongsTo(User, { foreignKey: "AdminId" });


    User.belongsToMany(Conversation, {
        through: ConversationParticipant,
        foreignKey: "userId",
        otherKey: "conversationId",
    });


    Conversation.belongsToMany(User, {
        through: ConversationParticipant,
        foreignKey: "conversationId",
        otherKey: "userId",
    });


    // Explicit associations for easier queries
    ConversationParticipant.belongsTo(User, { foreignKey: "userId" });
    ConversationParticipant.belongsTo(Conversation, { foreignKey: "conversationId" });
    User.hasMany(ConversationParticipant, { foreignKey: "userId" });
    Conversation.hasMany(ConversationParticipant, { foreignKey: "conversationId" });

    Conversation.hasMany(ConversationParticipant, { foreignKey: "conversationId", as: "ConversationParticipantsAll" });


    // One-to-many: Conversation -> Messages
    Conversation.hasMany(Message, { foreignKey: "conversationId" });
    Message.belongsTo(Conversation, { foreignKey: "conversationId" });


    // One-to-many: User -> Messages
    User.hasMany(Message, { foreignKey: "senderId" });
    Message.belongsTo(User, { foreignKey: "senderId" });

}

module.exports = defineAssociation
