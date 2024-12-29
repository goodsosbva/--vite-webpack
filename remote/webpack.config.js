const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/main.ts',
    mode: 'production', // 실제 스크립트에선 자동 처리. scripts.build 에서도 --mode=production
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'http://localhost:5001/',
        clean: true,
        // var 형태로 노출
        library: { name: 'remote', type: 'var' },
    },
    resolve: {
        extensions: ['.ts', '.js', '.vue']
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin(),
        new ModuleFederationPlugin({
            name: 'remote',         // var 전역에서 'window.remote'
            filename: 'remoteEntry.js',
            exposes: {
                './Exposed': './src/Exposed.vue'
            },
            shared: {
                vue: {
                    singleton: true,
                    requiredVersion: '^3.2.0',
                    eager: false // lazy 로딩
                }
            }
        })
    ]
};
