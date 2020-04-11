const path = require('path')
const env = require('std-env')

const rootDir = path.resolve(__dirname, '../../')
const resolveWithRoot = relative => path.resolve(rootDir, relative)

module.exports = function createConfig() {
    const srcDir = resolveWithRoot('src')
    const clientDir = path.join(srcDir, 'client')
    
    return {
        env,
        paths: {
            clientDir,
            clientEntry: path.join(clientDir, 'index.js'),
            clientOutput: resolveWithRoot('build')
        }
    }
}