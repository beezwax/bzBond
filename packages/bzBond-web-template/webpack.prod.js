const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require('./plugins/inline-chunk-html-plugin')

module.exports = merge(common, {
  mode: "production",
  plugins: [new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/app.bundle/])],
});
