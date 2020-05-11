const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin')


module.exports = {
    plugins: [
        new webpack.IgnorePlugin(/jsdom/),
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
        'mutationobserver-shim': false,
    }
};
