const chalk = require('chalk')
const commandLineUsage = require('command-line-usage')

const commandSchema = require('./command-schema')
const commandKeys = Object.keys(commandSchema)

async function help(config) {
    const { selectedHelpCommand } = config

    function getGeneralUsage() {
        return commandLineUsage([{
            content: 'Project Starter'
        }, {
            content: commandKeys.map(command => {
                return { name: command, summary: commandSchema[command].description }
            }),
            header: 'Available Commands'
        }, {
            content: 'Run this with a specific command to see more help'
        }])
    }

    function getCommandUsage(selected) {
        console.log(selected)
        const command = commandSchema[selected]
        return commandLineUsage[{
            content: command.description,
            header: selected
        }, {
            header: 'Command Options',
            optionList: command.options
        }]
    }

    if (!selectedHelpCommand) {
        console.log(getGeneralUsage())
        return
    }

    console.log(getCommandUsage(selectedHelpCommand))
    return
}

help.init = (passedConfig, args) => {
    if (args.command) {
        console.log(args)
        return { ...passedConfig, selectedHelpCommand: args.command }
    }
    return passedConfig
}

module.exports = help