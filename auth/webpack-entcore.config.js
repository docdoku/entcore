var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        'ng-app': './auth/src/main/resources/public/temp/entcore/ng-app.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname + 'dest'
    },
    resolve: {
        modulesDirectories: ['bower_components', 'node_modules'],
        root: path.resolve('.'),
        extensions: ['', '.js']
    },
    devtool: "source-map",
        module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ]
    }
}