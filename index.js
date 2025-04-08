const User = require('./models/userModel')

const loginRouter = require('./routes/login-routes')
const chatRouter = require('./routes/chat-routes')
const liveChatRouter = require('./routes/liveChat-router')
const app = require('./configs/express')


// routes
app.use('/', loginRouter)
app.use('/chat', chatRouter)
app.use('/live-chat', liveChatRouter)

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
        return
    }
    res.render('dashboard')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

// controller
app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const newUser = new User({
        username: username,
        password: password
    })

    newUser.save()
    res.redirect('/')
})


// Start Server bind with Socket IO
const { server } = require('./configs/socketIo')
server.listen(8080, (e) => {
    console.log('Socket IO listen on port 8080')
})





/*
app.listen(8080, () => {
    console.log('Server running on port 3030');
})*/