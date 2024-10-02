// webpack.config.cjs
const CopyPlugin = require("copy-webpack-plugin");
const { fileURLToPath } = require("url");
const path = require("path");

const dirName = path.dirname(__filename);

module.exports = {
  target: "node",
  entry: "./src/main.js",
  output: {
    path: path.resolve(dirName, "dist"),
    filename: "bundle.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    alias: {
      "~": path.resolve(dirName, "src"),
    },
    extensions: [".js", ".jsx"],
    mainFields: ["browser", "module", "main"],
  },
  module: {
    rules: [
      {
        test: /\.js|\.jsx$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(dirName, "src", "extension.js"),
          to: path.resolve(dirName, "dist"),
        },
        {
          from: path.resolve(dirName, "resources", "icon.png"),
          to: path.resolve(dirName, "dist", "resources"),
        },
      ],
    }),
  ],
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  optimization: {
    minimize: true,
  },
};
