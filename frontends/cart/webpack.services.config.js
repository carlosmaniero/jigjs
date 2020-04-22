const path = require('path');


module.exports = {
    mode: 'production',
    entry: {
        "services/services": './src/services/services.ts',
        "components/cart-count-component": './src/components/cart-count-component.ts',
    },
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
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    }
};
