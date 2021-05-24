const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
  entry: {
    dummy: `${__dirname}/src/dummy.tsx`,
    main: `${__dirname}/src/index.tsx`
  },
  target: 'web',
  output: {
    path: `${__dirname}/dist/`,
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss', '.sass', '.css']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      },
      {
          test: /\.gz$/,
          use: 'arraybuffer-loader'
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: {
      name: 'fgo_data',
      chunks: 'initial',
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      excludeChunks: [ 'dummy' ]
    })
  ]
}