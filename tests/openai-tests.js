const { OpenAI } = require('openai')
const encodeImage = require('./encodeImageToBase64')

const openaiClient = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: 'AIzaSyAPvXYGOtsu2zRJA4LyXgfKOUZafe8bwTA'
})


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
                            url: `data:image/jpeg;base64,${ImageBase64}`
                        }
                    }
                ]
            }
        ]
    })
    
    console.log(responses.choices[0].message.content)
}

main()