const express = require('express')
const flash = require('connect-flash')
const bodyParser = require('body-parser')

const app = express()

// buat Middleware
app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(require('./expressSession'))
app.use(flash())
app.set("view engine", "ejs")


module.exports = app