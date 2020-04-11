const chalk = require('chalk')
const { emptyDir } = require('fs-extra')
const { measureFileSizesBeforeBuild, printFileSizesAfterBuild } = require('react-dev-utils/FileSizeReporter')

const { 
    compileWebpack,
    createWebpackCompiler,
    createWebpackConfig
} = require('../webpack')

const BUNDLE_GZIP_LIMIT = 512 * 1024
const CHUNK_GZIP_LIMIT = 1024 * 1024

module.exports = async function build(config) {
    const { clientOutput } = config.paths

    console.log(chalk.cyan('Evaluating the previous build output if there is one..'))
    const previousBuildSizes = await measureFileSizesBeforeBuild((clientOutput))
    console.log(chalk.cyan('Cleaning previous build files...'))
    await emptyDir(config.paths.clientOutput)
    console.log(chalk.green('Successfully remove previous build files. Begining new build'))

    const compiler = createWebpackCompiler(createWebpackConfig(config))
    const { stats, warnings } = await compileWebpack(compiler)

    if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n\n'))
        console.log(`\nSearch for the ${chalk.underline(chalk.yellow('keywords'))} to learn more about each warning`)
        console.log(`If this is a lint warning, add ${chalk.cyan('// eslint-disable-next-line')}
            to the line before to ignore it if you feel it necessary
        `)
    } else {
        console.log(chalk.green('Build compiled successfully!'))
    }

    console.log('File sizes after compression:\n')
    printFileSizesAfterBuild(
        stats,
        previousBuildSizes,
        clientOutput,
        BUNDLE_GZIP_LIMIT,
        CHUNK_GZIP_LIMIT
    )
}