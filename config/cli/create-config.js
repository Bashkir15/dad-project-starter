const createDefaultConfig = require('./default-config')

const ident = x => x

// Higher order function that creates config sets.
// Returns a function that accepts a modify function that is 
// specific to the command, or defaults to an identity function
// to return the global modifications only
module.exports = function createConfigFactory({ args, command }) {
    let config = {
        ...createDefaultConfig(),
        currentCommand: command
    }

    // Apply the global options here
    const withAppliedGlobals = Object.keys(args).reduce((acc, key) => {
        if (key === 'env') {
            return {
                ...acc,
                env: { ...acc.env, [key]: args[key] }
            }
        }
        return { ...acc, [key]: args}
    }, config)

    return (fn = ident) => {
        return fn(withAppliedGlobals, args)
    }
}