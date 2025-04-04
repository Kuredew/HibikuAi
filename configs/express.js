const express = require('express')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const session = require('express-session')


const app = express()
const MongoStore = require('connect-mongo')

const { mongoDbConnectionUri } = require('../constants/environment')

// buat Middleware
app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: mongoDbConnectionUri
    })
}))
app.use(flash())
app.set("view engine", "ejs")

module.exports = app