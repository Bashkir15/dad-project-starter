const http = require('http')
const path = require('path')

const initExpress = require('./init-express')

const config = {
    buildDir: path.join(__dirname, '../../build')
}

function startServer() {
    const app = initExpress(config)
    const server = http.createServer(app)
    server.listen(8080, () => {
        console.log('listening')
    })
}

startServer()