const Chat = require('../models/chatModel')


async function findChat(username){
    const chat = await Chat.find({username: username})

    console.log(chat)
    return chat
}

async function loadChat(username, chatId) {
    const chat = await Chat.findOne({username: username, uuid: chatId})

    console.log(chat)

    return chat
}

module.exports = {
    findChat,
    loadChat
}