const commandSchema = require('./command-schema')

const build = require('./build')
const dev = require('./dev')
const help = require('./help')

const commandMap = { build, dev, help }
module.exports = { commandMap, commandSchema }