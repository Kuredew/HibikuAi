const router = require('express').Router()
const chatController = require('../controller/chat-controller')
const verify = require('../middlewares/verify')

router.post('/answer', verify.isLogin, chatController.answer)
router.get('/:uuid', verify.isLogin, chatController.load)

module.exports = router