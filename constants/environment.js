const openAiApiKey = process.env.OPEN_AI_API_KEY
const openAiBaseUrl = process.env.OPEN_AI_BASE_URL

const mongoDbConnectionUri = process.env.MONGO_DB_CONNECTION_URI

module.exports = {
    openAiApiKey,
    openAiBaseUrl,
    mongoDbConnectionUri
}