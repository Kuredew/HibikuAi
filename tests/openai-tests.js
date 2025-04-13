const { OpenAI } = require('openai')
const encodeImage = require('../utils/encodeImageToBase64')
const axios = require('axios')
const openaiClient = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: 'AIzaSyAPvXYGOtsu2zRJA4LyXgfKOUZafe8bwTA'
})

async function getBase64(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' })

    return `data:${response.headers['content-type']};base64, ${Buffer.from(response.data).toString('base64')}`
}

async function main() {
    const imagePath = 'public/Furina 5.jpg'
    const ImageBase64 = encodeImage(imagePath)

    const responses = await openaiClient.chat.completions.create({
        model: 'gemini-2.0-flash',
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Siapa ini??'
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: await getBase64('https://res.cloudinary.com/ddsuizdgf/image/upload/v1744437012/wuce2kfpqdlih4jkubwx.png')
                        }
                    }
                ]
            }
        ]
    })
    
    console.log(responses.choices[0].message.content)
}

main()