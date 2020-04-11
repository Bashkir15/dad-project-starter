const express = require('express')
const path = require('path')

module.exports = function createApp(config) {
    const app = express()

    app.disable('etag')

    // Parse req.body
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    // Tell the app anytime a request comes to /build look for the path after that
    // in the BUILD-DIR
    app.use('/build', express.static(config.buildDir, {
        dotfiles: 'ignore',
        fallthrough: false,
        index: false,
        lastModified: true,
        redirect: false
    }))

    app.get('/', (req, res) => {
        res.sendFile(path.join(config.buildDir, 'index.html'))
    })

    return app
}