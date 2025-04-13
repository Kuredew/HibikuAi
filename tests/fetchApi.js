
async function makeQuote() {
    const urlApi = 'https://zenquotes.io/api/random'

    const response = await fetch(urlApi)

    console.log(await response.json())
}

makeQuote()