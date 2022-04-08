const path = require('path')
const webpack = require('webpack')
const ExtensionReloader = require('webpack-extension-reloader')

module.exports = {
  devtool: 'cheap-source-map',
  entry: {
    background: path.join(__dirname, './src/background'),
    'inject-icon': path.join(__dirname, './src/inject-icon.js'),
  },
  output: {
    path: path.join(__dirname, './public'),
    filename: '[name].js',
  },
  plugins: [
    new ExtensionReloader({
      manifest: path.resolve(__dirname, 'public/manifest.json'),
      reloadPage: true,
      entries: {
        contentScript1: 'injectIcon',
        background: 'background',
      },
    }),
    new webpack.DefinePlugin({
      'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
    }),
  ],
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
}
