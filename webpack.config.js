const path = require('path');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'operationkit.min.js'
  }
};