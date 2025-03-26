const mongoose = require('../configs/mongoConnection')

const chatSchema = new mongoose.Schema({
    username: String,
    name: String,
    uuid: String,
    content: Array
})

module.exports = chatSchema