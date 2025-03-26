const router = require('express').Router()
const verifyUser = require('../middlewares/verify')

const loginController = require('../controller/login-controller')
const dashboardController = require('../controller/dashboard-conroller')
const socketIoController = require('../controller/socketIo-controller')
const chatController = require('../controller/chat-controller')
const { io } = require('../controller/socketIo-controller')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function broadcast(req, res) {
    await sleep(1000)
    console.log('Mendapatkan Id : ', req.session.socketId)
    io.to(req.session.socketId).emit('alert', 'Test broadcast') // Berhasil, ini ditampilkan dalam console log browser.
}

router.get('/', verifyUser.isLogin, socketIoController.listen, chatController.render, broadcast)
router.get('/login', verifyUser.isLogout, loginController.formLogin)

router.post('/login', loginController.login)

module.exports = router