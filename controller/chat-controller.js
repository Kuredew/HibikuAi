
// Needed library
const showdown = require('showdown')
const hljs = require('highlight.js')
const { randomUUID } = require('crypto')

// Constants
const socketIdArray = require('../constants/socketIo')
const object = require('../constants/session')

// Model
const Chat = require('../models/chatModel')

// Configs
const io = require('../configs/socketIo')

// Services
const openaiController = require('../services/openAi')
const { findChat, loadChat } = require('../services/findChat')



const converter = new showdown.Converter()


async function answer(req, res) {
    const messageUser = req.query.message
    const user = req.session.user

    if (object.session.chatId[user]){
        const chatId = object.session.chatId[user]

        //res.json({ message: `Data Berhasil di dapatkan, pesanmu adalah ${messageUser}` })
        //console.log(req.body)

        var chatContent = await loadChat(user, chatId)
        var chatContentList = chatContent['content']
    } else {
        var chatContentList = []
        chatContentList.push({
            role: 'system',
            content: 'namamu Kureichi, kamu adalah asisten yang sangat penyayang dan perhatian, kamu selalu pernyabar dalam menjawab pertanyaan pertanyaan user'
        })
    }

    const userMsgObj = {
        role: "user",
        content: messageUser
    }

    chatContentList.push(userMsgObj)

    var response = await openaiController.ask(chatContentList)


    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let responses = ''
    for await (const chunk of response){
        console.log(chunk)
        
        const responseFinal = chunk.choices[0]?.delta?.content || ''
        console.log(responseFinal)
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
            console.log(responses)

            break
        }
        res.write(responseFinal)
        responses += responseFinal
    }

    /*res.json({
        message: response
    })*/

    

    if (object.session.newChat[user]) {
        const pertanyaan = `Buatkan aku sebuah title chat dari percakapan berikut ini (OUTPUT HANYA TITLE, karena balasanmu akan langsung aku masukkan kedalam Web chatku), berikut percakapannya :\n\nPerson1 : ${messageUser}\n\nPerson2 : ${responses}`
        const pertanyaanObjList = [{
            role: 'system',
            content: 'Kamu adalah asisten yang bertugas membuat judul dari percakapan user dan ai, kamu hanya bisa menjawab judulnya, kamu tidak diperbolehkan berbicara selain itu, selain itu, jawablah user dengan bahasa yang dipahami oleh user.'
        },{
            role: 'user',
            content: pertanyaan
        }]

        const response2 = await openaiController.askNoStream(pertanyaanObjList)

        console.log(`Membuat Title baru berjudul: ${response2}`)

        io.to(socketIdArray[req.session.user]).emit('new-chat-title', response2) // TIDAK BERHASIL, ini yang ingin aku tanyakan kepadamu GPT, client tidak mendengarkan emit yang ini, apa masalahnya?, apa aku melakukan kesalahan?

        uuidGenerated = randomUUID()

        const newChat = new Chat({
            username: req.session.user,
            name: response2,
            uuid: uuidGenerated,
            content: chatContentList
        })
        newChat.save()

        object.session.chatId[user] = uuidGenerated
        object.session.newChat[user] = false

        console.log(req.session)
    }
}

async function load(req, res) {
    const chatId = req.query.chatId

    object.session.newChat[req.session.user] = false
    object.session.chatId[req.session.user] = chatId
    object.session.liveChat[req.session.user] = false
    
    let chatListConverted = []
    const loadedChat = await loadChat(req.session.user, chatId)
    const chat = await findChat(req.session.user)
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
        console.log(chatListObj)
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
    console.log(chatListConverted)
    loadedChatList = []

    res.render('chat', { user: loadedChat.name, chats: chatHistoryList.reverse(), loadedChat: chatListConverted })

}
async function render(req, res, next) {   
    object.session.newChat[req.session.user] = true
    object.session.chatId[req.session.user] = undefined
    object.session.liveChat[req.session.user] = false

    const findedChat = await findChat(req.session.user)
    res.render('chat', { user: req.session.user, chats: findedChat.reverse(), loadedChat: []})

    next()
}

function log(req, res) {
    console.log(socketIdArray)
    console.log('session yang ada pada /chat ', req.session)
}

async function log2(req, res) {
    console.log(object.session)
    if (object.session.newChat[req.session.user]) {
        object.session.newChat[req.session.user] = false
        console.log('NewChat session dimatikan.')

        console.log(object.session)
    }
}

module.exports  = { answer, load, render, log, log2 }