const openAiClient = require('../configs/openAi')


async function ask(chatContentList) {
    const responses = await openAiClient.chat.completions.create({
        model: 'gemini-2.0-flash',
        messages: chatContentList,
        stream: true
    })
    
    return responses
}

async function askNoStream(chatContentList) {
    const responses = await openAiClient.chat.completions.create({
        model: 'gemini-2.0-flash',
        messages: chatContentList
    })
    
    return responses.choices[0].message.content
}

module.exports = {ask, askNoStream}