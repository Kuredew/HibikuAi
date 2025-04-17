const { loadChat } = require('../services/findChat')


async function addObj(obj) {
    let chatContent = await loadChat('8998', 'ngawur')

    chatContent.content.push(obj)
    chatContent.save()
}

module.exports = { addObj }