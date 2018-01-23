let path = require('path')

module.exports = {
  entry: {
    main: './main.js',
    vendors: './vendors.js'
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["es2015"]
        }
      }
    }]
  }
}
