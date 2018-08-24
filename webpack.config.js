const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const del = require('del');

const dtpDir = path.resolve(path.dirname(require.resolve('eonasdan-bootstrap-datetimepicker')));

module.exports = (env, argv) => {
  const prod = argv.mode !== 'development';

  del.sync(`${dtpDir}/../../node_modules/**`);

  return {
    context: __dirname,
    devtool: prod ? 'source-map' : 'inline-source-map',
    entry: {
      client: './src/client/index.js',
      calendar: './src/calendar/index.js',
    },
    output: {
      path: path.join(__dirname, './build/bundles'),
      filename: '[name].js',
    },
    externals: {
      jquery: 'jQuery',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              plugins: [
                'transform-object-rest-spread',
                'syntax-dynamic-import',
              ],
            },
          },
        },
        {
          test: /\.js$/,
          include: /node_modules/,
          use: './loaders/removeAMD',
        },
      ],
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({ sourceMap: true }),
      ],
    },
    plugins: [
      new webpack.IgnorePlugin(/(locale|lang)$/, /(moment|fullcalendar)$/),
    ],
  };
};
