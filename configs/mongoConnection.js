const mongoose = require('mongoose')
const { mongoDbConnectionUri } = ('../constants/environment')

mongoose.connect(
    mongoDbConnectionUri,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)

module.exports = mongoose