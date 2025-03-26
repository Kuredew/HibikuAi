const Chat = require('../models/chatModel')

async function read() {
    const chat = await Chat.find({username: 'Test'})

    console.log(chat[0]['content'])
}

read()