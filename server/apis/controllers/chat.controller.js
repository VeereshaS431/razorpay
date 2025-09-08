const Chat = require("../models/chat.model")
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // For AES-256
const iv = crypto.randomBytes(16);  // For AES-256-CBC


function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}


function decrypt(text) {
    let ivBuffer = Buffer.from(text.iv, 'hex');
    let encryptedTextBuffer = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), ivBuffer);
    let decrypted = decipher.update(encryptedTextBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


const createChat = async (req, res) => {
    try {
        const { message, userId, adminId } = req.body
        // console.log("messagefromchat", encrypt(message))
        // console.log("decrypt message", decrypt("4e65b52c89632c703918609f27900d6e"))
        const chat = await Chat.create({
            // message: encrypt(message),
            message,
            userId,
            AdminId: adminId
        })
        req.io.to(`${userId}`).emit("message", chat);
        res.json({ message: "sucessfuly sends", chat })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "server error" })
    }

}


const getChat = async (req, res) => {
    try {
        const { id, userId } = req.query
        console.log(id, userId, "from chat")
        const chat = await Chat.findAll({ where: { AdminId: id, userId } })
        // chat.forEach(msg => {
        //     msg.message = decrypt(msg.message)
        // })
        return res.status(200).json(chat)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "server error" })
    }
}



module.exports = {
    createChat,
    getChat
}