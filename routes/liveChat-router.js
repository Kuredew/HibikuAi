const verify = require('../middlewares/verify')
const router = require('express').Router()
const liveChatController = require('../controller/liveChat-controller')

router.get('/', verify.isLogin, liveChatController.render)
router.post('/answer', verify.isLogin, liveChatController.answer)

module.exports = router