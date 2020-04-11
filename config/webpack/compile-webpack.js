module.exports = function compileWebpack(compiler) {
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                return reject(err)
            }
            return resolve(stats)
        })
    })
}