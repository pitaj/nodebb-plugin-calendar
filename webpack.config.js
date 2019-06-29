const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const del = require('del');

const eslintrcCalendar = require('./src/calendar/.eslintrc');
const eslintrcClient = require('./src/client/.eslintrc');

const getIgnores = eslintrc => eslintrc.rules &&
  eslintrc.rules['import/no-unresolved'] &&
  eslintrc.rules['import/no-unresolved'][1] &&
  eslintrc.rules['import/no-unresolved'][1].ignore;

const dtpDir = path.resolve(path.dirname(require.resolve('eonasdan-bootstrap-datetimepicker')));

module.exports = (env, argv) => {
  const prod = argv.mode !== 'development';

  del.sync(`${dtpDir}/../../node_modules/**`);

  const requirejsModules = new Set([
    ...getIgnores(eslintrcCalendar),
    ...getIgnores(eslintrcClient),
  ]);

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
      alias: {
        './render$': path.resolve(__dirname, './src/calendar/render.js'),
      },
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
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-syntax-dynamic-import',
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
        new TerserPlugin({
          sourceMap: true,
          parallel: true,
        }),
      ],
    },
    plugins: [
      new webpack.IgnorePlugin(/(locale|lang)/, /(moment|fullcalendar)/),
    ],
  };
};
