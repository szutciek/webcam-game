const path = require("path");

module.exports = {
  entry: "./client/script.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "webpack.bundle.js",
  },
};
