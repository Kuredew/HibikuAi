const express = require('express')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const session = require('express-session')


const app = express()
const MongoStore = require('connect-mongo')(session)
const { db } = require('./mongoConnection')

// buat Middleware
app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection: db
    })
}))
app.use(flash())
app.set("view engine", "ejs")

module.exports = app