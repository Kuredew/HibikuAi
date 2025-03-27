

const sidebar = document.getElementById('sidebar')
const btnSidebar = document.getElementById('btn-sidebar')
const backgroundSidebar = document.getElementById('background-sidebar')
const nav = document.getElementById('nav')
const profile = document.getElementById('profile')
const main = document.getElementById('main')
main.scrollTop = main.scrollHeight
const backgroundProfileOptions = document.getElementById('background-profile-options')
const sendButton = document.getElementById('send-btn')
const chatContainer = document.getElementById('chat-container')
const inputChat = document.getElementById('input-chat')
const chatHistory = document.getElementById('chat-history')
const username = document.getElementById('username')

const apiEndpoint = `${window.location.protocol}//${window.location.hostname}`
console.log(`Loaded apiEndpoint at ${apiEndpoint}`)

function toggleSidebar(){
    sidebar.classList.add('show');
    backgroundSidebar.classList.add('background-sidebar')
}

hljs.configure({useBR: true})


hljs.highlightAll()

// Import Socket IO
const socket = io(apiEndpoint)

socket.on('new-chat-title', (title) => {
    console.log(`Mendapatkan judul baru : ${title}`)

    const div = document.createElement('div')
    div.classList.add('chat-box')
    div.classList.add('active')
    
    const a = document.createElement('a')
    div.appendChild(a)

    const p = document.createElement('p')
    a.appendChild(p)

    p.innerHTML = title

    const kalimat = title.split(/(\s)/)
    let kalimatStr = ''
    for (const kata of kalimat) {
        kalimatStr += kata

        username.innerHTML = kalimatStr

        sleep(20)
    }

    chatHistory.insertBefore(div, chatHistory.firstChild)
})


socket.on('live-chat-message', (obj) => {
    const thisUser = username.innerHTML
    console.log(obj)

    const user = obj['user']
    const message = obj['message']
    const finalMessage = `**${user}**<br>${message}`

    if (!(thisUser == user) && window.location.pathname == '/live-chat') {
        addMessage(finalMessage, 'friend-chat')
        console.log('Mendapatkan pesan dari websocket.')
    }
})

socket.on('alert', (content) => {
    console.log(content)
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

btnSidebar.addEventListener('click', toggleSidebar)
backgroundSidebar.addEventListener('click', (e) => {
    sidebar.classList.remove('show')
    backgroundSidebar.classList.remove('background-sidebar')
})

function toggleProfileOptions() {
    const div = document.createElement('div')
    const logoutA = document.createElement('a')
    const logoutButton = document.createElement('button')

    logoutButton.innerHTML = 'Logout'
    logoutA.addEventListener('click', (e) => {
        window.location.href = '/logout'
    })

    div.appendChild(logoutA)
    div.classList.add('profile-options')

    logoutA.appendChild(logoutButton)

    nav.appendChild(div)

    backgroundProfileOptions.classList.add('background-profile-options')

    backgroundProfileOptions.addEventListener('click', (e) => {
        div.remove()
        backgroundProfileOptions.classList.remove('background-profile-options')
    })
}

profile.addEventListener('click', toggleProfileOptions)



// Message Handling
const testText = 'lorem ipsum fdsalfjdslkafklsdjkckdsnklckdsfkfnklasfsd fsadjklfdsjal fdsn fkldsnfdn fkdsfkdscn skafnknd dsncdskcjsnc dscndscj dsjncdslancs al'

const converter = new showdown.Converter()
async function addMessage(text, entity, stream=false) {
    const userChat = document.createElement('div')
    userChat.classList.add(entity == 'ai' ? 'ai-chat' : entity == 'user' ? 'user-chat' : 'friend-chat')
    chatContainer.appendChild(userChat)

    if (stream) {
        const reader = text.body.getReader()
        const decoder = new TextDecoder('utf-8')

        let kalimatStrStream = ''
        while (true) {
            const { done, value } = await reader.read()

            if (done) {
                hljs.highlightAll()

                break
            }

            const chunk = decoder.decode(value)
            console.log(chunk)

            const words = chunk.split(/(\s)/)

            for await (const word of words) {
                kalimatStrStream += word

                const converted = converter.makeHtml(kalimatStrStream)

                userChat.innerHTML = converted
                /*
                main.scrollTo({
                    top: main.scrollHeight,
                    behavior: 'smooth'
                })*/
                main.scrollTop = main.scrollHeight

                await sleep(10)
            }
        }
        
/*
        const words = text.split(/(\s)/)
        wordCollection = ''
        for await (const word of words) {
            wordCollection += word
            const converted = converter.makeHtml(wordCollection)

            userChat.innerHTML = converted
            hljs.highlightAll()

            main.scrollTop = main.scrollHeight

            await sleep(10)
        }*/
        
    } else {
        userChat.innerHTML = converter.makeHtml(text)
        
        main.scrollTo({
            top: main.scrollHeight,
            behavior: 'smooth'
        })
        //main.scrollTop = main.scrollHeight
    }
}

async function userSend(text) {
    addMessage(text, 'user')
    //addMessage(testText, 'ai', stream=true)
    //main.scrollTop = main.scrollHeight

    /*
    const request = await fetch('http://localhost:3030/chat/answer',{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "message" : text
        })
    })*/

    /*
    while (true) {
        const { value } = await reader.read()
        const decoded = decoder.decode(value)

        if (decoded == '') {
            return
        }

        console.log(decoded)
    }*/
    if (!(window.location.pathname == '/live-chat')) {
        const request = await fetch(`${apiEndpoint}/chat/answer?message=${text}`)
        await addMessage(request, 'ai', true)
    } else if (window.location.pathname == '/live-chat') {
        const thisUser = username.innerHTML

        //socket.emit('live-chat-message', { message: text, user: thisUser })
        console.log('Mengirim pesan ke socket io')
        
        await fetch(`${apiEndpoint}/live-chat/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: text
            })
        })
        .then(console.log('Terkirim.'))
    }

/*
    const response = await request.json()
    const message = response.message
    console.log(message)

    await addMessage(message, 'ai', true)*/
}

sendButton.addEventListener('click', (e) => {
    userSend(inputChat.value)
    inputChat.value = ''
})

inputChat.addEventListener('keypress', (e) => {
    if (e.key == 'Enter') {
        userSend(inputChat.value)
        inputChat.value = ''
    }
})