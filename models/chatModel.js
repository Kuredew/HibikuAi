const chatSchema = require('../schemas/chatSchema')
const mongoose = require('../configs/mongoConnection')

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat