const mongoose = require('mongoose')
const { mongoDbConnectionUri } = require('../constants/environment')

mongoose.connect(
    mongoDbConnectionUri,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
mongoose.Promise = global.Promise
const db = mongoose.connection

module.exports = { mongoose, db }