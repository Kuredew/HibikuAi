const fs = require('fs')

function encodeImage(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath)
    const ImageBase64 = imageBuffer.toString('base64')

    return ImageBase64
}

function saveToFile(filePath, content) {
    fs.writeFileSync(filePath, content)
}

function main() {
    const imagePath = 'public/Furina 5.jpg'
    const ImageBase64 = encodeImage(imagePath)

    console.log(ImageBase64)

    const base64FilePath = 'tests/image.txt'
    saveToFile(base64FilePath, ImageBase64)
    console.log('Base64 image are successfully write to file.')
}

module.exports = encodeImage