const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin')


module.exports = {
    plugins: [
        new webpack.IgnorePlugin(/jsdom/),
    ],
    entry: {
        "components": './src/components/register-browser.ts',
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
        child_process: 'empty',
        jsdom: 'empty'
    }
};
