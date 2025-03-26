const router = require('express').Router()
const chatController = require('../controller/chat-controller')
const verify = require('../middlewares/verify')

router.get('/answer', verify.isLogin, chatController.answer)
router.get('/', verify.isLogin, chatController.load)

module.exports = router