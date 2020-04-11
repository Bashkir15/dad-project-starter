const chalk = require('chalk')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')

module.exports = function compileWebpack(compiler) {
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages

            if (err) {
                if (!err.message) return reject(err)

                let errMessage = err.message
                if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
                    errMessage = `${errMessage} \n CompileError: Begins at CSS Selector
                    ${err['postcssNode'].selector}`
                }
                
                messages = formatWebpackMessages({
                    errors: [errMessage],
                    warnings: []
                })
            } else {
                messages = formatWebpackMessages(stats.toJson({
                    all: false,
                    errors: true,
                    warnings: true
                }))
            }

            if (messages.errors.length) {
                // Only keep first error. Others are often indicative of the
                // same problem and just create noise
                if (messages.errors.length > 1) {
                    messages.errors.length = 1
                }
                return reject(new Error(messages.errors.join('\n\n')))
            }

            return { stats, warnings: messages.warnings }
        })
    })
}