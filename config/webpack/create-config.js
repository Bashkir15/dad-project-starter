const path = require('path')
const safePostCssParser = require('postcss-safe-parser')
const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const ExtractPlugin = require('mini-css-extract-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
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
                include: /node_modules/,
                test: /\.mjs$/,
                type: 'javascript/auto'
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
            }],
            strictExportPresence: true
        },
        optimization: {
            checkWasmTypes: false,
            minimize: env.prod,
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true,
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
                        map: {
                            annotation: true,
                            inline: false
                        },
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
            devtoolModuleFilenameTemplate: ({ resourcePath }) => {
                return path.resolve(resourcePath).replace(/\\/g, '/')
            },
            filename: env.prod ? `${HASH_STRING}.js` : '[name].js',
            libraryTarget: 'var',
            path: paths.clientOutput,
            pathinfo: env.dev,
            publicPath: paths.webpackPublicPath
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
            new AssetsPlugin({
                filename: 'assets.json',
                path: paths.clientOutput
            }),
            new ManifestPlugin({
                filter: item => item.isChunk,
                fileName: path.join(paths.clientOutput, 'chunks.json'),
                generate: (seed, files) => {
                    const entrypoints = new Set()
                    files.forEach(file => {
                        ((file.chunk || {})._groups || []).forEach(group => {
                            entrypoints.add(group)
                        })
                    })
                    const entries = [...entrypoints]
                    const entryArrayManifest = entries.reduce((acc, entry) => {
                        const name = (entry.options || {}).name || (entry.runtimeChunk || {}).name
                        const files = []
                            .concat(
                                ...(entry.chunks || []).map(chunk => {
                                    return chunk.files.map(chunkFilePath => paths.webpackPublicPath + chunkFilePath)
                                })
                            )
                            .filter(Boolean)
                        
                        const mapFiles = (passedFiles, ext) => passedFiles
                                .map(item => (item.indexOf(ext) !== -1 ? item : null))
                                .filter(Boolean)
                        const cssFiles = mapFiles(files, '.css')
                        const jsFiles = mapFiles(files, '.js')

                        if (name) {
                            return {
                                ...acc,
                                [name]: { css: cssFiles, js: jsFiles }
                            }
                        }
                        return acc
                    }, seed)
                    return entryArrayManifest
                }
            }),
            currentCommand === 'dev' && new webpack.HotModuleReplacementPlugin(),

            env.prod && new ExtractPlugin({
                allChunks: true,
                chunkFilename: '[name].[contenthash:8].css',
                filename: '[name].[contenthash:8].css'
            }),
            env.prod && new webpack.HashedModuleIdsPlugin(),
            env.prod && new webpack.optimize.AggressiveMergingPlugin(),

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

        ].filter(Boolean),
        resolve: {
            extensions: ['.js', '.json'],
        }
    }
}