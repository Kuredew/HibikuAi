const Chat = require('../models/chatModel')


async function findChat(userId){
    try {
        const chat = await Chat.find({userId: userId})
        return chat
    } catch(e) {
        console.log('[ ERROR ] Connection reset while finding chat history for User')
        return false
    }
}

async function loadChat(userId, chatId) {
    try {
        const chat = await Chat.findOne({userId: userId, uuid: chatId})
        return chat
    } catch {
        console.log('[ ERROR ] Connection reset while loading chat history for User')
        return false
    }
}

module.exports = {
    findChat,
    loadChat
}