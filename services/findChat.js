const Chat = require('../models/chatModel')


async function findChat(userId){
    const chat = await Chat.find({userId: userId})

    console.log(chat)
    return chat
}

async function loadChat(userId, chatId) {
    const chat = await Chat.findOne({userId: userId, uuid: chatId})

    console.log(chat)

    return chat
}

module.exports = {
    findChat,
    loadChat
}