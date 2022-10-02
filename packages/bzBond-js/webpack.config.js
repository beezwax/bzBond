const path = require("path");

const webExport = {
  mode: "none",
  entry: ["core-js/es/promise", "./bzBond.js"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bzBond-web.js",
  },
  target: ["web", "es5"],
  module: {
    rules: [
      {
        test: /\.js$/,
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
};

const webProdExport = {
  ...webExport,
  devtool: "hidden-source-map",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bzBond-web.min.js",
  },
};

module.exports = [webExport, webProdExport];
