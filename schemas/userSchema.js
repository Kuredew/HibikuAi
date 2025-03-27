const { mongoose } = require('../configs/mongoConnection')

const userSchema = new mongoose.Schema({
    username: String,
    password: String
})
const User = mongoose.model('User', userSchema)

module.exports = userSchema