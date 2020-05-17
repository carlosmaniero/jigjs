const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDevelopment = process.env.DEV;

const developmentPlugins = isDevelopment ? [new BundleAnalyzerPlugin()] : [];

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    plugins: [
        ...developmentPlugins,
        new webpack.IgnorePlugin(/jsdom/),
        new webpack.IgnorePlugin(/mutationobserver-shim/),
    ],
    module: {
        rules: [
            {
                test: /\.*.ts$/,
                use: 'ts-loader',
                exclude: [
                    /node_modules/
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    output: {
        jsonpFunction: 'jigJsonpFlightsWidget',
        filename: '[name].app.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve('./dist'),
    },
    optimization: {
        usedExports: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    ecma: 6,
                },
            })
        ]
    },
    node: {
        net: 'empty',
        fs: 'empty',
        tls: 'empty',
        process: false,
        child_process: 'empty',
        jsdom: 'empty',
        setImmediate: 'empty',
        'mutationobserver-shim': 'empty',
    }
};
