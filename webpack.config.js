const webpack = require('webpack');
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
    filename: '[name].bundle.js',
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
          {
            loader: 'babel-loader',
            query: {
              presets: ['es2015-native-modules'],
              plugins: ['transform-runtime'],
            },
          },
        ],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loaders: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['es2015-native-modules'],
              plugins: ['transform-runtime'],
            },
          },
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
  plugins: [
    // new webpack.LoaderOptionsPlugin({
    //   minimize: isProd,
    //   debug: !isProd,
    // }),
    // isProd && new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //   },
    //   output: {
    //     comments: false,
    //   },
    //   sourceMap: false,
    // }),
    new webpack.ProvidePlugin({
      fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      minChunks: 2,
    }),
  ],
};

// console.log(module.exports);
