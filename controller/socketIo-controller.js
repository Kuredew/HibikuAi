const io = require('../configs/socketIo')
const socketIdArray = require('../constants/socketIo')


function listen(req, res, next){
    io.on('connection', (socket) => {
        socketIdArray[req.session.user] = socket.id
        console.log(`\n[ ${socket.id} ] Connected to Server`)
    })
    next()
}

module.exports = { listen, io, socketIdArray }