const WebpackDevServer = require('webpack-dev-server')

const {
    createWebpackConfig,
    createWebpackCompiler
} = require('../webpack')

module.exports = async function dev(config) {
    console.log('Preparing the dev server..')
    const compiler = createWebpackCompiler(createWebpackConfig(config))
    const devServer = new WebpackDevServer(compiler, {
        hot: true,
        https: true,
        inline: true,
        onListening: server => {
            const { port } = server.listeningApp.address()
            console.log(`Devserver listening on port: ${port}`)
        },
        open: 'Google Chrome',
        overlay: { errors: true, warnings: false },
        port: 8081,
        proxy: {
            '/api': 'http://localhost:8080'
        },
        publicPath: '/',
        writeToDisk: true
    })

    devServer.listen(8081, 'localhost', () => {
        // Take this time to potentially start the express server
    })
}