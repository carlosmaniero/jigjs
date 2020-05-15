const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
    plugins: [
        new BundleAnalyzerPlugin(),
        new webpack.IgnorePlugin(/jsdom/),
        new webpack.IgnorePlugin(/mutationobserver-shim/),
    ],
    entry: {
        "init": './src/components/init.ts',
    },
    module: {
        rules: [
            {
                test: /\.*$/,
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
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
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
        'mutationobserver-shim': 'empty',
    }
};
