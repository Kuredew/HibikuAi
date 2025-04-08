require('dotenv').config()

const openAiApiKey = process.env.OPEN_AI_API_KEY
const openAiBaseUrl = process.env.OPEN_AI_BASE_URL

const mongoDbConnectionUri = process.env.MONGO_DB_CONNECTION_URI

const mainAiContext = process.env.MAIN_AI_CONTEXT

const titleAiContext = process.env.TITLE_AI_CONTEXT
const titleAiQuestion = process.env.TITLE_AI_QUESTION

module.exports = {
    openAiApiKey,
    openAiBaseUrl,
    mongoDbConnectionUri,
    mainAiContext,
    titleAiContext,
    titleAiQuestion
}