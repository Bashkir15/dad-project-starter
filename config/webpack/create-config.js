const path = require('path')

const webpack = require('webpack')
const ExtractPlugin = require('mini-css-extract-plugin')
const HtmlPlugin = require('html-webpack-plugin')

const HASH_STRING = '[name].[contenthash:8]'

module.exports = function createConfig({ currentCommand, env, paths }) {
    return {
        devtool: env.prod ? 'source-map' : 'cheap-module-eval-source-map',
        entry: {
            main: paths.clientEntry
        },
        mode: env.prod ? 'production' : 'development',
        module: {
            rules: [{
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react'],
                        plugins: [
                            '@babel/plugin-proposal-object-rest-spread',
                            '@babel/plugin-proposal-class-properties'
                        ]
                    }
                }]
            }, {
                test: /\.scss$/,
                use: [
                    env.prod ? ExtractPlugin.loader : 'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }]
        },
        output: {
            chunkFilename: env.prod ? `${HASH_STRING}.js` : '[name].js',
            filename: env.prod ? `${HASH_STRING}.js` : '[name].js',
            path: paths.clientOutput,
            publicPath: '/build/'
        },
        plugins: [ 
            new HtmlPlugin({
                filename: 'index.html',
                template: path.join(paths.clientDir, 'index.html')
            }),
            currentCommand === 'dev' && new webpack.HotModuleReplacementPlugin(),
            
            env.prod && new ExtractPlugin({
                chunkFilename: '[name].[contenthash:8].css',
                filename: '[name].[contenthash:8].css'
            })
        ].filter(Boolean)
    }
}