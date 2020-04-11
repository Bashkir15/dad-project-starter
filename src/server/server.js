const http = require('http')
const path = require('path')

const createApp = require('./create-app')

const config = {
    buildDir: path.join(__dirname, '../../build')
}

function startServer() {
    const app = createApp(config)
    const server = http.createServer(app)
    server.listen(8080, () => {
        console.log('listening')
    })
}

startServer()