const router = require('express').Router()
const verifyUser = require('../middlewares/verify')

const loginController = require('../controller/login-controller')
const dashboardController = require('../controller/dashboard-conroller')
const chatController = require('../controller/chat-controller')


router.get('/', verifyUser.isLogin, chatController.render)
router.get('/login', verifyUser.isLogout, loginController.formLogin)

router.post('/login', loginController.login)

module.exports = router