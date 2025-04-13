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
let chatId = window.location.pathname.split('/')[2]
console.log(chatId)

function removeWelcome() {
    document.querySelector('.welcome').remove()
}

let isWelcomeRemoved
if (chatContainer.contains(document.querySelector('.user-chat'))) {
    removeWelcome()

    chatContainer.style.paddingBottom = '165px'
    isWelcomeRemoved = true
} else {
    isWelcomeRemoved = false
}

sendButton.disabled = true
mainScrollDown()

const textarea = document.getElementById('input-chat');

        textarea.addEventListener('input', (e) => {
            if (textarea.value.length > 0) {
                sendButton.disabled = false
            } else {
                sendButton.disabled = true
            }

            textarea.style.height = '40px'
            let scrollHeight = textarea.scrollHeight
            textarea.style.height = `${scrollHeight}px`
            chatContainer.style.paddingBottom = `${165 + scrollHeight - 40}px`
        })

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
        console.log('Mendapatkan pesan dari SocketIo')
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

function mainScrollDown() {
    main.scrollTo({
        top: main.scrollHeight,
        behavior: 'smooth'
    })
}

// Message Handling
const testText = 'lorem ipsum fdsalfjdslkafklsdjkckdsnklckdsfkfnklasfsd fsadjklfdsjal fdsn fkldsnfdn fkdsfkdscn skafnknd dsncdskcjsnc dscndscj dsjncdslancs al'

const converter = new showdown.Converter()
async function addMessage(text, entity, stream=false) {
    const userChat = document.createElement('div')
    userChat.classList.add(entity == 'ai' ? 'ai-chat' : entity == 'user' ? 'user-chat' : 'friend-chat')
    chatContainer.appendChild(userChat)

    if (stream) {

        // Delete Loading
        document.querySelector('.loader').remove()

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

            const words = chunk.split(/(\s+)/)

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
        
        mainScrollDown()

        await sleep(500)

        loadingDiv = document.createElement('div')
        loadingDiv.classList.add('loader')

        chatContainer.appendChild(loadingDiv)
        
        mainScrollDown()

        //main.scrollTop = main.scrollHeight
    }
}

async function addAttachments(fileDescArray) {
    const attachmentsDiv = document.createElement('div')
    attachmentsDiv.classList.add('attachments')
    chatContainer.appendChild(attachmentsDiv)

    innerHTML = ''
    for (const file of fileDescArray) {
        const HTML = `
                            <div id="file" class="file-wrapper">
                                <div class="thumbnail"><i class="fa-solid fa-file"></i></div>
                                <div class="description-wrapper">
                                    <span class="title">${file.file_name}</span>
                                    <span class="full-size">${file.file_size}<a href="${file.file_url}"><i class="fa-solid fa-link link"></i></a></span>
                                </div>
                            </div>`
        innerHTML += HTML
    }
    attachmentsDiv.innerHTML = innerHTML
}
async function userSend(text) {
    fileContainer.innerHTML = ''

    if (!(isWelcomeRemoved)) {
        removeWelcome()
    }

    await addAttachments(fileDescArray)
    await addMessage(text, 'user')

    if (!chatId) {
        chatId = crypto.randomUUID()
        window.history.replaceState(null, 'NewChat', `/chat/${chatId}`)
    }
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
        const chatJSON = {
            role: "user",
            content: [
                {
                    type: 'text',
                    text: text
                }
            ]
        }
        
        // Check klo ada file
        
        if (fileArray.length > 0) {
            for (const file of fileArray) {
                chatJSON.content.push(file)
            }
        }
        console.log(chatJSON)

        const request = await fetch(`${apiEndpoint}/chat/answer`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: chatId,
                files: fileDescArray,
                data: chatJSON
            })
        })
        await addMessage(request, 'ai', true)

        // Kosongin
        fileDescArray = []
        fileArray = []
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
    if (e.key == 'Enter' && !e.shiftKey) {
        console.log(e.key)
        e.preventDefault();

        sendButton.click()
        inputChat.value = ''
    }
})


// File Function
const fileContainer = document.querySelector('.file-container')
const fileInput = document.getElementById('file-input')
const fileBtn = document.getElementById('file-btn')

let fileArray = []
let fileDescArray = []

// For Debug
let fileArrays = [{
    type: "image_url",
    image_url: {
        url: 'https://res.cloudinary.com/ddsuizdgf/image/upload/v1744437012/wuce2kfpqdlih4jkubwx.png,'
    }
}]
let fileDescArrays = [{
    file_name: 'fileName',
    file_url: 'secureURL',
    file_size: 'sizeCalculated'
}]

fileBtn.addEventListener('click', (e) => {
    fileInput.click()
})

fileInput.onchange = async e => {
    const file = e.target.files[0]
    const fileName = file.name
    const size = Math.floor(file.size / 1024)
    const sizeCalculated = size >= 1000 ? `${Math.floor(size / 1024)} MB` : `${size} KB` 
    const type = file.type

    const fileWrapper = document.createElement('div')
    fileWrapper.classList.add('file-wrapper')
    fileContainer.appendChild(fileWrapper)

    const preparingHTML = `  <div id="file" class="file-wrapper">
                                    <div class="thumbnail"><i class="fa-solid fa-file"></i></div>
                                    <div class="description-wrapper">
                                        <span class="title">${fileName}</span>
                                        <span class="full-size">Preparing...</span>
                                    </div>
                                </div>`

    fileWrapper.innerHTML = preparingHTML

    uploadFile(fileName, fileWrapper, file, sizeCalculated, type)
}


function uploadFile(fileName, fileWrapper, file, sizeCalculated, type) {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', 'chatMediaAI')

    console.log('Uploading ' + fileName)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/ddsuizdgf/upload', true)

    xhr.upload.onprogress = function (e) {
        const total = e.total
        const uploaded = e.loaded

        console.log(total, uploaded)

        const progress = Math.round(uploaded / total * 100)

        const progressHTML = `  <div id="file" class="file-wrapper">
                                    <div class="thumbnail"><i class="fa-solid fa-file"></i></div>
                                    <div class="description-wrapper">
                                        <span class="title">${fileName}</span>
                                        <span class="full-size">${sizeCalculated}</span>
                                        <div class="progress-bar">
                                            <div class="progress" style="width: ${progress}%" ></div>
                                        </div>
                                    </div>
                                </div>`

        fileWrapper.innerHTML = progressHTML
    }

    xhr.onload = () => {
        const completeHTML = `
                        <div class="thumbnail"><i class="fa-solid fa-file"></i></div>
                        <div class="description-wrapper">
                            <span class="title">${fileName}</span>
                            <span class="full-size">${sizeCalculated}</span>
                        </div>`
        
        fileWrapper.innerHTML = completeHTML

        const response = JSON.parse(xhr.responseText)
        const secureURL = response.secure_url

        console.log(secureURL)

        fileArray.push({
            type: "image_url",
            image_url: {
                url: secureURL,
            }
        })

        fileDescArray.push({
            file_name: fileName,
            file_url: secureURL,
            file_size: sizeCalculated
        })

        //console.log(fileArray)
    }

    xhr.send(formData)
}