const Chat = require('../models/chatModel')


async function findChat(userId){
    const chat = await Chat.find({userId: userId})

    return chat
}

async function loadChat(userId, chatId) {
    const chat = await Chat.findOne({userId: userId, uuid: chatId})

    return chat
}

module.exports = {
    findChat,
    loadChat
}