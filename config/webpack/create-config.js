const path = require('path')
const safePostCssParser = require('postcss-safe-parser')
const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
const ExtractPlugin = require('mini-css-extract-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

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
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                require('postcss-flexbugs-fixes'),
                                require('postcss-preset-env')({
                                    autoprefixer: {
                                        flexbox: 'no-2009',
                                        grid: 'autoplace'
                                    },
                                    features: {
                                        'nesting-rules': true,
                                        'prefers-color-scheme-query': true
                                    },
                                    stage: 2
                                })
                            ]

                        }
                    },
                    'sass-loader'
                ]
            }]
        },
        optimization: {
            checkWasmTypes: false,
            minimize: env.prod,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            comparisons: false,
                            ecma: 5,
                            inline: 2
                        },
                        mangle: { safari10: true },
                        output: {
                            ascii_only: true,
                            comments: false,
                            ecma: 5
                        },
                        parse: { ecma: 8 }
                    }
                }),
                new OptimizeCSSPlugin({
                    cssProcessorOptions: {
                        map: false,
                        parser: safePostCssParser
                    },
                    cssProcessorPluginOptions: {
                        preset: ['default', {
                            discardComments: { removeAll: true },
                            minifyFontValues: { removeQuotes: false }
                        }]
                    }
                })
            ],
            nodeEnv: false,
            // Create decent config here for later
            splitChunks: env.prod ? { chunks: 'all' } : false,
            runtimeChunk: {
                name: entry => `runtime-${entry.name}`
            }
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
                minify: {
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    minifyURLs: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true
                },
                template: path.join(paths.clientDir, 'index.html')
            }),

            currentCommand === 'dev' && new webpack.HotModuleReplacementPlugin(),

            env.prod && new ExtractPlugin({
                chunkFilename: '[name].[contenthash:8].css',
                filename: '[name].[contenthash:8].css'
            }),
            env.prod && new CompressionPlugin({
                algorithm: 'gzip',
                compressionOptions: { level: 9 },
                filename: '[path].gz[query]',
                minRatio: 0.8,
                test: /\.(js|css|html|svg)$/
            }),
            env.prod && new CompressionPlugin({
                algorithm: 'brotliCompress',
                compressionOptions: { level: 11 },
                filename: '[path].br[query]',
                minRatio: 0.8,
                test: /\.(js|css|html|svg)$/
            })

        ].filter(Boolean)
    }
}