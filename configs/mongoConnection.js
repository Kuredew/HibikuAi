const mongoose = require('mongoose')
const { mongoDbConnectionUri } = require('../constants/environment')

mongoose.connect(
    mongoDbConnectionUri,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)

module.exports = mongoose