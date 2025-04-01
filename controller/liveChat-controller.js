const {findChat, loadChat} = require('../services/findChat')
const object = require('../constants/session')
const io = require('../configs/socketIo')
const Chat = require('../models/chatModel')

async function render(req, res) {
    object.session.liveChat[req.session.user] = true
    const loadedChat = await loadChat('8998', 'ngawur')
    const loadedChatContent = loadedChat['content']

    const chatHistory = await findChat(req.session.userId)
    const chatHistoryReverse = chatHistory.reverse()

    res.render('chat', { user: req.session.user, chats: chatHistoryReverse, loadedChat: loadedChatContent})
}

async function answer(req, res) {
    const message = req.body.message
    const user = req.session.user

    io.emit('live-chat-message', { message: message, user: user })

    let chatContent = await loadChat('developersnigger', 'ngawur')

    let chatContentList = chatContent['content']

    let obj = {
        role: user,
        content: message
    }
    chatContentList.push(obj)
    chatContent.content = chatContentList
    //chatContent.save()

    res.send('end')
    console.log('Mendapatkan pesan POST dan membroadcast ke semua user.')
}

module.exports = {render, answer}