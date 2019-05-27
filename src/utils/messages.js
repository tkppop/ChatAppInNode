const genMessageWithTimesstamp = (username, text) => {
    return {
        username,
        text,
        createdAt : new Date().getTime()
    }
}

const genLocationMsgWithTimesstamp = (username, url) => {
    return {
        username,
        url,
        createdAt : new Date().getTime()
    }
}


module.exports = {
    genMessageWithTimesstamp,
    genLocationMsgWithTimesstamp
}