const webpack = require("webpack");

module.exports = {
  entry: "./app/main.tsx",
  mode: "development",
  output: {
    path: __dirname + "/dist",
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
          { loader: "css-loader", options: { "minimize": true } }
        ]
      }
    ]
  }
};
