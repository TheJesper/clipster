// webpack.config.js
"use strict";

const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const config = {
  target: "node",
  entry: "./src/extension.js", // Update to your entry file
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js",
    libraryTarget: "commonjs",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.js|\.jsx$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "extension.js"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
  ],
};

module.exports = config;
