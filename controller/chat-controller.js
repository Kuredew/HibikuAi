// Needed library
const showdown = require('showdown')
const hljs = require('highlight.js')
const { randomUUID } = require('crypto')

// Constants
const socketIdArray = require('../constants/socketIo')
const object = require('../constants/session')
const { mainAiContext, titleAiContext, titleAiQuestion } = require('../constants/environment')

// Model
const Chat = require('../models/chatModel')

// Configs
const { io } = require('../configs/socketIo')

// Services
const openaiController = require('../services/openAi')
const { findChat, loadChat } = require('../services/findChat')

// Map
const { get: socketSessionGet } = require('../utils/sessionSocketMap')

const converter = new showdown.Converter()


async function answer(req, res) {
    const messageUser = req.query.message
    const user = req.session.userId

    let chatContent
    let chatContentList

    if (object.session.chatId[user]){
        const chatId = object.session.chatId[user]

        //res.json({ message: `Data Berhasil di dapatkan, pesanmu adalah ${messageUser}` })
        //console.log(req.body)

        chatContent = await loadChat(user, chatId)
        chatContentList = chatContent['content']
    } else {
        chatContentList = []
        chatContentList.push({
            role: 'system',
            content: mainAiContext
        })
    }

    const userMsgObj = {
        role: "user",
        content: messageUser
    }

    chatContentList.push(userMsgObj)

    console.log(chatContentList)
    var response = await openaiController.ask(chatContentList)


    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let responses = ''
    for await (const chunk of response){
        
        const responseFinal = chunk.choices[0]?.delta?.content || ''
        if ('finish_reason' in chunk.choices[0]) {
            console.log('Streaming selesai!')
            res.write(responseFinal)
            responses += responseFinal
            res.end()

            const aiMsgObj = {
                role: 'assistant',
                content: responses
            }
        
            chatContentList.push(aiMsgObj)
            if (object.session.chatId[user]) {
                chatContent.content = chatContentList
                chatContent.save()
            }

            break
        }
        res.write(responseFinal)
        responses += responseFinal
    }

    /*res.json({
        message: response
    })*/



    if (object.session.chatId[user] == undefined) {
        const socketId = socketIdArray[req.session.id]

        const pertanyaan = `${titleAiQuestion}\n\nPerson1 : ${messageUser}\n\nPerson2 : ${responses}`
        const pertanyaanObjList = [{
            role: 'system',
            content: titleAiContext
        },{
            role: 'user',
            content: pertanyaan
        }]

        const response2 = await openaiController.askNoStream(pertanyaanObjList)

        console.log(`Membuat Chat baru berjudul: ${response2}`)

        io.to(socketId).emit('new-chat-title', response2) // TIDAK BERHASIL, ini yang ingin aku tanyakan kepadamu GPT, client tidak mendengarkan emit yang ini, apa masalahnya?, apa aku melakukan kesalahan?

        uuidGenerated = randomUUID()

        const newChat = new Chat({
            username: req.session.user,
            userId: req.session.userId,
            name: response2,
            uuid: uuidGenerated,
            content: chatContentList
        })
        newChat.save()

        object.session.chatId[user] = uuidGenerated
        object.session.newChat[user] = false

    }
}

async function load(req, res) {
    const chatId = req.query.chatId
    const user = req.session.userId

    object.session.chatId[user] = chatId
    object.session.liveChat[user] = false

    let chatListConverted = []
    const loadedChat = await loadChat(req.session.userId, chatId)
    const chat = await findChat(req.session.userId)
    const chatHistoryList = []

    for (const chats of loadedChat.content) {
        const role = chats['role']
        const content = chats['content']

        const convertedContent = converter.makeHtml(content)
        const replaceNToBr = convertedContent.replace(/\n/g, "<br>")

        const chatListObj = {
            role: role,
            content: convertedContent
        }
        chatListConverted.push(chatListObj)
    }

    for (const chats of chat) {
        const chatName = chats['name']
        const uuid = chats['uuid']

        const obj = {
            name: chatName,
            uuid: uuid,
            active: (uuid == chatId) ? true : false
        }

        chatHistoryList.push(obj)
    }
    loadedChatList = []

    res.render('chat', { user: loadedChat.name, chats: chatHistoryList.reverse(), loadedChat: chatListConverted })

}
async function render(req, res, next) {   
    object.session.chatId[req.session.userId] = undefined
    object.session.liveChat[req.session.userId] = false

    const findedChat = await findChat(req.session.userId)
    res.render('chat', { user: req.session.user, chats: findedChat.reverse(), loadedChat: []})

    next()
}

function log(req, res) {
    console.log('session yang ada pada /chat ', req.session)
}

async function log2(req, res) {
    if (object.session.newChat[req.session.user]) {
        object.session.newChat[req.session.user] = false
        console.log('NewChat session dimatikan.')

    }
}

module.exports  = { answer, load, render, log, log2 }