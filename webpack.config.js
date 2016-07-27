const webpack = require('webpack');
const path = require('path');
// const fs = require('fs');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

// const dir = path.resolve(path.dirname(require.resolve('moment')), './locale');
// const locales = fs.readdirSync(dir).map(locale => path.basename(locale, '.js'));
// let alias = locales.map(locale =>
//   locale.includes('-') &&
//   !locales.includes(locale.split('-')[0]) &&
//   { [path.join('moment/locale/', locale.split('-')[0])]: path.join('moment/locale/', locale) }
// )
// .filter(Boolean);
// alias = Object.assign({}, ...alias);

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
      'node_modules',
    ],
    root: [],
    // alias,
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
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      minChunks: 2,
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]),
    // function resolve(compiler) {
    //   const locs = locales.map(locale => path.join('moment/locale/', locale));
    //
    //   compiler.resolvers.normal.plugin('module', (request, callback) => {
    //     if (
    //       !locs.includes(request.request)
    //     ) {
    //       if (locs.includes(request.request.split('-')[0])) {
    //         callback(null, Object.assign({}, request, {
    //           request: request.request.split('-')[0],
    //         }));
    //         return;
    //       }
    //       const r = request.request.split('-')[0];
    //       const locale = locs.find(loc => loc.split('-')[0] === r);
    //       if (locale) {
    //         callback(null, Object.assign({}, request, {
    //           request: locale,
    //         }));
    //         return;
    //       }
    //     } else {
    //       callback();
    //     }
    //   });
    // },
  ],
};

// console.log(module.exports);
