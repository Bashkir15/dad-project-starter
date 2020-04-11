const commandLineArgs = require('command-line-args')
const commandLineCommands = require('command-line-commands')

const commandMap = require('../commands')
const schema = require('./command-schema')
const createConfig = require('./create-config')

const validCommands = Object.keys(schema)

process.on('uncaughtException', err => {
    console.error(`Uncaught exception: ${err}`)
    if (err.stack) {
        console.error(err.stack)
    }
    process.exit(1)
})

process.on('unhandledRejection', err => {
    console.error(`Promise rejection: ${err}`)
    if (err.stack) {
        console.error(err.stack)
    }
    process.exit(1)
})

async function run() {
    const { argv, command } = commandLineCommands(validCommands)
    const args = commandLineArgs(schema[command].options, { argv })
    const config = createConfig()

    try {
        console.log(`Running command ${command}`)
        const result = await commandMap[command](config)
        console.log('Finished!')
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

run()