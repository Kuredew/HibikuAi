const http = require('http');
//const { Server } = require('socket.io')
const app = require('./express')

const server = http.Server(app)

const io = require('socket.io')(server)

const socketIdArray = require('../constants/socketIo')

const sharedSession = require('express-socket.io-session')


io.use(sharedSession(require('./expressSession')))

io.on('connection', (socket) => {
    //socketIdArray[req.session.userId] = socket.id
    const session = socket.handshake.session

    if (session && session.id) {
        socketIdArray[session.id] = socket.id
        console.log(`[ INFO ] ${socket.id} Connected to Server`)
    }

    socket.on('disconnect', () => {
        if (session && session.id) {
            delete socketIdArray[session.id]

            console.log(`[ INFO ] ${socket.id} Disconnected`)
        }
    })
})

module.exports = { io, server }