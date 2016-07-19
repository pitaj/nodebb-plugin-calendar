// const webpack = require('webpack');
const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

module.exports = {
  devtool: isProd ? 'hidden-source-map' : 'eval-source-map',
  context: __dirname,
  entry: {
    client: './src/client/index.js',
    calendar: './src/calendar/index.js',
  },
  output: {
    path: path.join(__dirname, './build'),
    filename: '[name].js',
  },
  // amd: {
  //   jQuery: true,
  // },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: [
          'style',
          'css',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
        ],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
          'ts-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.ts'],
    modules: [
      path.resolve('./src/client/vendor'),
      'node_modules',
    ],
    root: [
      path.resolve('./src/client/vendor'),
    ],
  },
  // plugins: [
  //   // new webpack.optimize.CommonsChunkPlugin({
  //   //   name: 'vendor',
  //   //   minChunks: Infinity,
  //   //   filename: 'vendor.bundle.js',
  //   // }),
  //   new webpack.LoaderOptionsPlugin({
  //     minimize: isProd,
  //     debug: !isProd,
  //   }),
  //   isProd && new webpack.optimize.UglifyJsPlugin({
  //     compress: {
  //       warnings: false,
  //     },
  //     output: {
  //       comments: false,
  //     },
  //     sourceMap: false,
  //   }),
  // ],
};

// console.log(module.exports);
