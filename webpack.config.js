const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./client/script.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "webpack.bundle.js",
  },
  mode: "production",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "client/index.html", to: "index.html" }],
    }),
  ],
};
