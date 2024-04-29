const path = require('path');

module.exports = {
  entry: {
    index: './src/index.ts',
    admin_page: './src/admin_page.ts',
  },
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: [path.resolve(__dirname, 'src')],
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    iife: false,
    publicPath: 'auto',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/script'),
  },
};