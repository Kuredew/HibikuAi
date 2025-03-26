const { OpenAI } = require('openai')

const openaiClient = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: 'AIzaSyAPvXYGOtsu2zRJA4LyXgfKOUZafe8bwTA'
})


async function main() {
    const responses = await openaiClient.chat.completions.create({
        model: 'gemini-2.0-flash',
        messages: [
            { role: 'developer', content: 'Talk like a pirate.' },
            { role: 'user', content: 'Are semicolons optional in JavaScript?' },
          ]
    })
    
    console.log(responses.choices[0].message.content)
}

main()