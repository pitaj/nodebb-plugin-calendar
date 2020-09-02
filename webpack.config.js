/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const del = require('del');

const dtpDir = path.resolve(path.dirname(require.resolve('eonasdan-bootstrap-datetimepicker')));

module.exports = (env, argv) => {
  const prod = argv.mode !== 'development';

  del.sync(`${dtpDir}/../../node_modules/**`);

  const requirejsModules = new Set([
    'composer',
    'composer/formatting',
    'translator',
    'benchpress',
  ]);

  return {
    context: __dirname,
    mode: prod ? 'production' : 'development',
    devtool: prod ? 'source-map' : 'inline-source-map',
    entry: {
      client: './src/client/index',
      calendar: './src/calendar/index',
    },
    output: {
      path: path.join(__dirname, './build/bundles'),
      filename: '[name].js',
      chunkFilename: '[name].[contenthash].js',
    },
    externals: [
      {
        jquery: 'jQuery',
        utils: 'utils',
      },
      (context, request, callback) => {
        if (requirejsModules.has(request)) {
          callback(null, `commonjs ${request}`);
          return;
        }

        callback();
      },
    ],
    resolve: {
      extensions: ['.js', '.ts'],
      alias: {
        './render$': path.resolve(__dirname, './src/calendar/render'),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
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
        new TerserPlugin({
          terserOptions: {
            sourceMap: true,
          },
          parallel: true,
        }),
      ],
    },
    plugins: [
      new webpack.IgnorePlugin(/(locale|lang)/, /(moment|fullcalendar)/),
    ],
  };
};
