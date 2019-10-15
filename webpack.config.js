const webpack = require("webpack");

module.exports = {
  entry: "./app/main.tsx",
  mode: "development",
  target: "electron-renderer",
  output: {
    path: __dirname + "/js",
    filename: "bundle.js"
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader"
      }, {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      }
    ]
  },
  externals: {
   "sharp": "commonjs sharp",
   "node-hid": "commonjs node-hid",
   "bufferutil": "commonjs bufferutil",
   "utf-8-validate": "commonjs utf-8-validate"
  }
};
