const environment = require('../constants/environment')
const mainAIContext = environment.mainAiContext

const openAI = require('../services/openAi')
const { io } = require('../configs/socketIo')
const { loadChat } = require('../services/findChat')
const ChatModel = require('../models/chatModel')

// Ask Assistant And Save to LiveCHat Chat.
const liveChatAddContent = require('../utils/liveChatAddContent')
async function liveChat(req, res) {
    //io.emit('live-chat-message', { message: data.content[0].text, user: req.session.user, userId: req.session.userId })

    let chatContent = await loadChat('310708', 'live-chat-ai')

    if (!(chatContent)) {
        chatContent = new ChatModel({
            username: 'SYSTEM',
            userId: '310708',
            name: 'live-chat-ai',
            uuid: 'live-chat-ai',
            content: [],
            contentHTML: []
        })

        const systemObj = {
            role: 'system',
            content: [
                {
                    type: 'text',
                    text: mainAIContext
                }
            ]
        }

        chatContent.content.push(systemObj)
    }

    const data = req.body
    chatContent.content.push(data)

    const response = await openAI.askNoStream(chatContent.content)

    const aiObj = {
        role: 'assistant',
        content: [
            {
                type: 'text',
                text: response
            }
        ]
    }
    
    chatContent.content.push(aiObj)
    chatContent.save()

    
    io.emit('live-chat-ai', response)

    liveChatAddContent.addObj(data)
    liveChatAddContent.addObj(aiObj)
}

module.exports = { liveChat }