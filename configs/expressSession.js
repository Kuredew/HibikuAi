const MongoStore = require('connect-mongo')

const { mongoDbConnectionUri } = require('../constants/environment')

const sessionMiddleware = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: mongoDbConnectionUri
    })
})

module.exports = sessionMiddleware