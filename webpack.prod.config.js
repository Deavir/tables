const path = require("path");
const autoprefixer = require("autoprefixer");
const htmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    devtool: "cheap-module-source-map",
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: ""
    },
    resolve: {
        extensions: [".js", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            plugins: () => [
                                autoprefixer({
                                    browsers: ["> 1%", "last 2 versions"]
                                })
                            ],
                            config: {
                                path: "./config/postcss.config.js"
                            }
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        query: {
                            modules: true,
                            sourceMap: true,
                            importLoaders: 2,
                            localIdentName: "[name]__[local]___[hash:base64:5]"
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            ident: "postcss",
                            plugins: () => [
                                autoprefixer({
                                    browsers: ["> 1%", "last 2 versions"]
                                })
                            ],
                            config: {
                                path: "./config/postcss.config.js"
                            }
                        }
                    },
                    "sass-loader"
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                loader: "url-loader?limit=8000&name=images/[name].ext"
            }
        ]
    },
    plugins: [
        new htmlWebpackPlugin({
            template: __dirname + "/src/index.html",
            inject: "body",
            filename: "index.html"
        }),
        new webpack.optimize.UglifyJsPlugin()
    ]
};
