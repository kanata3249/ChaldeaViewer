const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    hot: true,
    open: true,
    https: false,
    static: {
      directory: `${__dirname}/dist/`
    }
  }
})
