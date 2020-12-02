const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: `${__dirname}/src/index.tsx`,
  target: 'web',
  output: {
    path: `${__dirname}/dist/`,
    filename: 'main.js',
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
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
}