const router = require('express').Router()

const oneShotController = require('../controller/oneShot-controller')

router.post('/live-chat', oneShotController.liveChat)

module.exports = router