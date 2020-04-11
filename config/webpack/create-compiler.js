const webpack = require('webpack')

module.exports = function createCompiler(webpackConfig) {
    let compiler
    
    try {
        compiler = webpack(webpackConfig)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }

    return compiler
}