const fs = require('fs')
const axios = require('axios')

const imageURL = 'https://res.cloudinary.com/ddsuizdgf/image/upload/v1744437012/wuce2kfpqdlih4jkubwx.png'

function writeToFile(base64) {
    fs.writeFileSync('tests/images.txt', base64)
}

axios.get(imageURL).then(response => {
    const buffer = response.data
    const base64 = Buffer.from(buffer).toString('base64')
    
    const base64Final = `data:${response.headers['content-type']};base64, ${base64}`

    writeToFile(base64Final)
    console.log(base64Final)
})