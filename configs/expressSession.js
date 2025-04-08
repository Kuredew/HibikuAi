const MongoStore = require('connect-mongo')

const { mongoDbConnectionUri } = require('../constants/environment')

const sessionMiddleware = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: mongoDbConnectionUri
    }),
    maxAge: Date.now() + (30 * 24 * 3600 * 1000)
})

module.exports = sessionMiddleware