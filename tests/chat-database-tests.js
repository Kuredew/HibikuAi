const Chat = require('../models/chatModel')
const { randomUUID } = require('crypto')

arrayChat = []

systemObj = {
    role: 'system',
    content: 'Youre a helpfull assistant'
}



userObj = {
    role: 'user',
    content: 'What is an AI?'
}

aiObj = {
    role: 'assistant',
    content: 'Ai is Artificical Intelegence'
}

arrayChat.push(systemObj)
arrayChat.push(userObj)
arrayChat.push(aiObj)

const newChat = new Chat({
    username: 'Test',
    name: 'How AI?',
    uuid: randomUUID(),
    content: arrayChat
})
newChat.save()

console.log('Selesai')