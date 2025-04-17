const {findChat, loadChat} = require('../services/findChat')
const object = require('../constants/session')
const { io } = require('../configs/socketIo')
const Chat = require('../models/chatModel')

const showdown = require('showdown')
const converter = new showdown.Converter()


async function render(req, res) {
    object.session.liveChat[req.session.user] = true
    const loadedChat = await loadChat('8998', 'ngawur')
    const loadedChatContent = loadedChat['content']

    const loadedChatContentConverted = []
    for await(const content of loadedChatContent) {
        let text = converter.makeHtml(content.content[0].text)
        content.content[0].text = text

        loadedChatContentConverted.push(content)
    }

    const chatHistory = await findChat(req.session.userId)
    const chatHistoryReverse = chatHistory.reverse()

    if (!(loadedChat) || !(chatHistory)) {
        res.send('Maaf bg, server lagi error bjir')
        return
    }

    res.render('live-chat', { userId: req.session.userId, user: req.session.user, chats: chatHistoryReverse, chatId: null, loadedChat: loadedChatContentConverted})
}


async function answer(req, res) {
    const message = req.body.message
    const userId = req.body.userId
    const user = req.session.user

    io.emit('live-chat-message', { message: message, user: user, userId: userId })

    let chatContent = await loadChat('8998', 'ngawur')

    let chatContentList = chatContent['content']

    let obj = {
        role: user,
        content: [
            {
                type: 'text',
                text: message
            }
        ]
    }
    chatContentList.push(obj)
    chatContent.content = chatContentList
    chatContent.save()

    res.send('end')
    console.log('[ INFO ] Mendapatkan pesan POST dan membroadcast ke semua user.')
}

module.exports = { render, answer }