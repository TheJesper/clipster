// webpack.config.cjs
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  target: "node",
  entry: "./src/extension.js", // The entry point for your extension
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "extension.js", // Output the bundled extension
    libraryTarget: "commonjs2",
  },
  devtool: "source-map",
  externals: {
    vscode: "commonjs vscode", // Exclude vscode module from bundling
  },
  resolve: {
    extensions: [".js", ".json"], // Ensure .js files are resolved
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply the rule to all .js files
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Use Babel loader for transpiling
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
          from: "src/*.js", // Copy all .js files from src to dist
          to: path.resolve(__dirname, "dist/[name].js"), // Keep the same file names in dist
        },
        {
          from: "resources/**/*", // Copy resources folder (e.g., icon.png)
          to: path.resolve(__dirname, "dist/[path][name][ext]"),
        },
      ],
    }),
  ],
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  optimization: {
    minimize: true, // Minify the output for production builds
  },
};
