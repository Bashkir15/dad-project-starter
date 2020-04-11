const { 
    compileWebpack,
    createWebpackCompiler,
    createWebpackConfig
} = require('../webpack')

module.exports = async function build(context) {
    // clear build here
    console.log('starting build')

    const compiler = createWebpackCompiler(createWebpackConfig(context))
    const stats = await compileWebpack(compiler)
    console.log('build finished!')
}