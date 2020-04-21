const path = require('path');


module.exports = {
    entry: './src/services/services.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.ts' ]
    },
    output: {
        filename: 'services/service.js',
        path: path.resolve(__dirname, 'dist'),
    }
};
