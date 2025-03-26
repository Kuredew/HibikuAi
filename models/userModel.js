const mongoose = require('../configs/mongoConnection')
const userSchema = require('../schemas/userSchema')

const User = mongoose.model('User', userSchema)

module.exports = User