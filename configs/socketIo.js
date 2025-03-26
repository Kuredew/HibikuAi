const http = require('http');
//const { Server } = require('socket.io')
const app = require('./express')

const server = http.Server(app)

const io = require('socket.io')(server)

server.listen(3030, (e) => {
    console.log('Socket IO listen on port 3030')
})

module.exports = io