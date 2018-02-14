const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// hide deprication warnings
process.noDeprecation = true;

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: ['whatwg-fetch', './index.js', './style/style.scss'],
  module: {
    noParse: /node_modules\/mapbox-gl\/dist\/mapbox-gl.js/,
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0']
        }
      },
      {
        test: /\.(json|geojson)$/,
        loader: 'json-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader'
            }
          ],
          // use style-loader in development
          fallback: 'style-loader'
        })
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  output: {
    path: `${__dirname}/assets/`,
    filename: 'js/[name].min.js'
  },
  plugins: [
    new ExtractTextPlugin({ filename: 'css/[name].min.css' }),
    new webpack.ProvidePlugin({
      $: 'jquery/dist/jquery.slim.js',
      jQuery: 'jquery/dist/jquery.slim.js',
      'window.jQuery': 'jquery/dist/jquery.slim.js',
      Popper: ['popper.js', 'default']
    })
  ]
};
