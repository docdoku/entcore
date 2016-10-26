var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        application: './workspace/src/main/resources/public/temp/app.js',
        behaviours: './workspace/src/main/resources/public/temp/behaviours.js'
    },
    output: {
        filename: '[name].js',
        path: __dirname + 'dest'
    },
    externals: {
        "entcore/entcore": "entcore",
        "entcore/libs/moment/moment": "entcore",
        "entcore/libs/underscore/underscore": "_",
        "entcore/libs/jquery/jquery": "entcore"
    },
    resolve: {
        root: path.resolve(__dirname),
        extensions: ['', '.js'],
        alias: {
            "toolkit": path.resolve(__dirname) + '/src/main/resources/public/temp/toolkit/index'
        }
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