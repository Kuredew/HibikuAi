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

// Utils
const encodeImage = require('../utils/encodeImageToBase64')
const axios = require('axios')

const converter = new showdown.Converter()


function pushAndSave(chatContent, obj) {
    chatContent.content.push(obj)

    chatContent.save()
}

function makeNewChat(username, userId, chatId) {

    const newChat = new Chat({
        username: username,
        userId: userId,
        name: null,
        uuid: chatId,
        content: [],
        contentHTML: []
    })
    return newChat
}

async function verifyChatIsExist(userId, chatId) {
    const check = await loadChat(userId, chatId)
    if (check) {
        return true
    }
    return false
}

function getChatId(userId) {
    if (verifyChatIsExist(userId)) {
        return object.session.chatId[userId]
    }
    return false
}

async function chatContentLoad(username, userId, chatId) {
    let chatContent = await loadChat(userId, chatId)
    if (chatContent) {
        chatContentArray = chatContent['content']

        return chatContent
    } else {
        chatContent = makeNewChat(username, userId, chatId)
        const newObj = {
            role: 'system',
            content: [
                {
                    type: 'text',
                    text: mainAiContext
                }
            ]
        }

        chatContent.content.push(newObj)
        chatContent.contentHTML.push(newObj)

        return chatContent
    }
}

function sendTitleToSocketIO(sessionId, title) {
    const socketId = socketIdArray[sessionId]
    io.to(socketId).emit('new-chat-title', title)
}

async function makeTitle(userMsg, AiMsg) {
    const pertanyaan = `${titleAiQuestion}\n\nPerson1 : ${userMsg}\n\nPerson2 : ${AiMsg}`
    const pertanyaanObjList = [{
        role: 'system',
        content: titleAiContext
    },{
        role: 'user',
        content: pertanyaan
    }]

    const title = await openaiController.askNoStream(pertanyaanObjList)

    console.log(`[ INFO ] Make title for New Chat: ${title}`)

    return title
}

async function saveChat(isChatExist, userId, sessionId, chatContent) {
    if (isChatExist) {
        chatContent.save()
    } else {
        userMessage = chatContent.content[1].content[0].text
        aiMessage = chatContent.content[2].content[0].text

        object.session.chatId[userId] = chatContent.uuid
        object.session.newChat[userId] = false

        const title = await makeTitle(userMessage, aiMessage)
        sendTitleToSocketIO(sessionId, title)
        
        chatContent.name = title
        chatContent.save()
    }
}

function isChatContainAttachments(messageObj) {
    if (messageObj.content.length > 1) {
        return true
    }
    return false
}

async function formatChat(messageObj, fileDescArray) {
    // Bikin variable salinan dari messageObj buat di push ke database
    const messageObjToDB = JSON.parse(JSON.stringify(messageObj))
    const messageObjToHTML = JSON.parse(JSON.stringify(messageObj))

    if (isChatContainAttachments(messageObj)) {
        let text = true

        for (const content of messageObj.content) {
            if (text) {
                text = false
                continue
            }

            // Hapus semua file object yang ada di content
            messageObjToDB.content.pop()
            messageObjToHTML.content.pop()


            const url = content.image_url.url

            const response = await axios.get(url, { responseType: 'arraybuffer' })

            const base64 = `data:${response.headers['content-type']};base64, ${Buffer.from(response.data).toString('base64')}`

            console.log(`[ INFO ] Converted URL Image to Base64 At ${content}`)
            content.image_url.url = base64
        }

        // Khusus untuk html, push deskripsi file ke array content
        for (const file of fileDescArray) {
            messageObjToHTML.content.push(file)
        }
    }
    return {
        toAI: messageObj,
        toDB: messageObjToDB,
        toHTML: messageObjToHTML
    }
}




async function answer(req, res) {
    console.log('[ INFO ] Received answer request from client')
    const chatId = req.body.chatId

    let fileDescArray = req.body.files
    let messageObj = req.body.data

    const userId = req.session.userId
    const username = req.session.user

    const isChatExist = await verifyChatIsExist(userId, chatId)

    let chatContent = await chatContentLoad(username, userId, chatId)

    console.log(`[ INFO ] Chat is Exist? ${isChatExist}`)

    messageObj = await formatChat(messageObj, fileDescArray)

    let response = await openaiController.ask(chatContent.content.concat(messageObj.toAI))

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let responses = ''
    for await (const chunk of response){
        
        // Ambil Response AI
        const responseFinal = chunk.choices[0]?.delta?.content || ''

        if ('finish_reason' in chunk.choices[0]) {
            console.log('[ INFO ] Streaming selesai!')

            res.write(responseFinal)
            res.end()
            
            responses += responseFinal

            const aiMsgObj = {
                role: 'assistant',
                content: [
                    {
                        type: 'text',
                        text: responses
                    }
                ]
            }
        
            chatContent.content.push(messageObj.toDB)
            chatContent.content.push(aiMsgObj)
            chatContent.contentHTML.push(messageObj.toHTML)
            chatContent.contentHTML.push(aiMsgObj)

            await saveChat(isChatExist, userId, req.session.id, chatContent)

            /*
            if (object.session.chatId[user]) {
                chatContent.content.push(aiMsgObj)
                chatContent.save()
            }*/

            break
        }
        res.write(responseFinal)
        responses += responseFinal
    }

    /*res.json({
        message: response
    })*/
/*
    if (object.session.chatId[user] == undefined) {
        const socketId = socketIdArray[req.session.id]

        const pertanyaan = `${titleAiQuestion}\n\nPerson1 : ${messageObj.content[0].text}\n\nPerson2 : ${responses}`
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
            content: chatContentArray
        })
        newChat.save()

        object.session.chatId[userId] = chatContent.uuid
        object.session.newChat[userId] = false

    }*/
}

function isValidUUID(uuid) {
    const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/
    return regex.test(uuid)
}

async function load(req, res) {
    const chatId = req.params.uuid
    const user = req.session.userId


    /*
    object.session.newChat[user] = 'anyink'
    object.session.chatId[user] = chatId
    object.session.liveChat[user] = false
    */
    console.log(`[ INFO ] Loading chat User(${user}) in Chat(${chatId})`)

    let chatListConverted = []
    const loadedChat = await loadChat(user, chatId)
    const chat = await findChat(req.session.userId)
    const chatHistoryList = []
    //console.log(loadedChat)

    // Fallback to root if chat is null
    if (!(loadedChat)) {
        res.redirect('/')
        return
    }

    for (const chats of loadedChat.contentHTML) {
        const role = chats['role']
        const content = chats.content

        const text = content[0].text
        
        const convertedContent = converter.makeHtml(text)
        const replaceNToBr = convertedContent.replace(/\n/g, "<br>")
        
        const chatListObj = {
            role: role,
            content: [{
                type: 'text',
                text: convertedContent
            }]
        }

        if (content.length > 1) {
            let index = 1

            while (true) {
                chatListObj.content.push(content[index])
                //console.log(content[index])
                
                if (index + 1 == content.length) {
                    break
                }
                index += 1
            }
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

    res.render('chat', { user: loadedChat.name, chatId: loadedChat.uuid, chats: chatHistoryList.reverse(), loadedChat: chatListConverted })

}
async function render(req, res, next) {

    //object.session.chatId[req.session.userId] = undefined
    //object.session.liveChat[req.session.userId] = false
    //object.session.newChat[req.session.userId] = true

    const findedChat = await findChat(req.session.userId)
    res.render('chat', { user: req.session.user, chatId: null, chats: findedChat.reverse(), loadedChat: []})
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