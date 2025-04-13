const User = require('../models/userModel')

function formLogin(req, res) {
    res.render('login', { message: req.flash('error') })
    return
}

async function login(req, res) {
    const username = req.body.username
    const password = req.body.password

    const user = await User.findOne({ username: username })
    //console.log(user.password)

    if (user && password == user.password) {
        req.session.user = user.username
        req.session.userId = user._id
        req.session.loggedIn = true
        res.redirect('/chat')
    } else {
        req.flash('error', 'Email/Username/Password Salah!')
        res.redirect('/login')
    }
}

function redirect(req, res) {
    res.redirect('/chat')
}

module.exports = { 
    formLogin,
    login,
    redirect
}