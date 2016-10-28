const webpack = require('webpack');
const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

const del = require('del');
const dtsDir = path.resolve(path.dirname(require.resolve('eonasdan-bootstrap-datetimepicker')));
const deleted = del.sync(`${dtsDir}/../../node_modules/**`);
if (deleted.length) {
  console.log('Deleted: ', deleted.join('\n') && 'moment from datetimepicker');
}

module.exports = {
  devtool: isProd ? 'hidden-source-map' : 'eval-source-map',
  context: __dirname,
  entry: {
    client: ['core-js/shim', './src/client/index.js'],
    calendar: ['core-js/shim', './src/calendar/index.js'],
  },
  output: {
    path: path.join(__dirname, './build/bundles'),
    filename: '[name].js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          {
            loader: 'babel-loader',
            query: {
              presets: [
                ['es2015', { modules: false }],
              ],
              plugins: [
                ['transform-runtime', {
                  polyfill: false,
                  regenerator: false,
                }],
              ],
            },
          },
        ],
      },
      {
        test: /\.js$/,
        include: /node_modules/,
        loader: './removeAMD',
      },
    ],
  },
  resolve: {
    extensions: ['', '.js'],
    modules: [
      'node_modules',
    ],
    root: [],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      minChunks: 2,
    }),
    new webpack.IgnorePlugin(/^\.\/(locale|lang)$/, [/(moment|fullcalendar)$/]),
  ],
};
