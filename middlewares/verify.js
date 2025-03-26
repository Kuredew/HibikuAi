const Chat = require('../models/chatModel')

const { findChat } = require('../services/findChat')

module.exports = {
    isLogin(req, res, next) {
        if (req.session.loggedIn) {
            next()
            return
        } else {
            res.render('index')
        }
    },
    async isLogout(req, res, next) {
        if (req.session.loggedIn !== true) {
            next()
            return
        }
        else {
            const chatHistory = await findChat(req.session.user)
            const chatHistoryReverse = chatHistory.reverse()

            res.render('chat', { user: req.session.user, chats: chatHistoryReverse, loadedChat: []})
        }
    }
}