const globalOptions = [{
    alias: 'e',
    description: 'The environment the current command should run in: like dev, prod, etc.',
    group: 'global',
    name: 'env',
    type: String
}, {
    alias: 'v',
    defaultValue: true,
    description: 'Turn on verbose debugging of output',
    group: 'global',
    name: 'verbose',
    type: Boolean
}]

module.exports = {
    build: {
        description: 'Build the application',
        options: [...globalOptions]
    },
    dev: {
        description: 'Start the application in development mode',
        options: [...globalOptions]
    },
    help: {
        description: 'Shows this help message, or help for a specific command',
        options: [...globalOptions, {
            defaultOption: true,
            description: 'The command to display help for',
            name: 'command'
        }]
    }
}