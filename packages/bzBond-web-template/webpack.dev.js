const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const packageInfo = require("./package.json");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  target: ["web", "es5"],
  entry: {
    entry: ["whatwg-fetch", "core-js/features/promise", "./src/js/index.js"],
  },
  devServer: {
    headers: [
      {
        key: "packageName",
        value: packageInfo.name
      },
      {
        key: "projectPath",
        value: __dirname
      }
    ]
  }
});
