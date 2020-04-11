const path = require('path')
const safePostCssParser = require('postcss-safe-parser')
const imageminMozJpeg = require('imagemin-mozjpeg')

const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const ExtractPlugin = require('mini-css-extract-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const ImagePlugin = require('imagemin-webpack-plugin').default
const ManifestPlugin = require('webpack-manifest-plugin')

const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ScriptExtPlugin = require('script-ext-html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')

const FONT_REGEX = /\.(woff|woff2|ttf|otf)$/
const HASH_STRING = '[name].[contenthash:8]'
const IMAGE_REGEX = /\.(jpe?g|png|gif|svg)$/
const MAX_SIZE = 512000

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
                }, {
                    loader: 'eslint-loader',
                    options: { fix: true }
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
            }, {
                test: IMAGE_REGEX,
                use: [{
                    loader: 'file-loader',
                    options: {
                        esModule: false,
                        name: 'images/[name].[ext]'
                    }
                }]
            }, {
                test: FONT_REGEX,
                use: [{
                    loader: 'file-loader',
                    options: {
                        esModule: false,
                        name: 'fonts/[name].[ext]'
                    }
                }]
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
            runtimeChunk: 'single'
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
        performance: env.dev
            ? false
            : { hints: false, maxAssetSize: MAX_SIZE, maxEntrypointSize: MAX_SIZE },
        plugins: [ 
            // Force webpack to write to the filesystem instead of just in memory
            new WriteFilePlugin(),

            // Parse our template html files and inject our scripts and copy them to the output dir
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

            // Give script tags the attribute of defer
            new ScriptExtPlugin({
                defaultAttribute: 'defer'
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

            // When we run the dev command we need to tell webpack to use hot module replacement
            currentCommand === 'dev' && new webpack.HotModuleReplacementPlugin(),

            // Extract the css into a file for production
            env.prod && new ExtractPlugin({
                allChunks: true,
                chunkFilename: '[name].[contenthash:8].css',
                filename: '[name].[contenthash:8].css'
            }),

            // Compress images in production
            env.prod && new ImagePlugin({
                gifsicle: { optimizationLevel: 9 },
                plugins: [imageminMozJpeg({ quality: '75' })],
                pngquant: { quality: '75' },
                test: IMAGE_REGEX
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