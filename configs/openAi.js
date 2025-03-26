const { OpenAI } = require('openai')
const { openAiBaseUrl, openAiApiKey } = require('../constants/environment')

const openAiClient = new OpenAI({
    baseURL: openAiBaseUrl,
    apiKey: openAiApiKey
})

module.exports = openAiClient