import path from "path";
import dotenv from "dotenv";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";

dotenv.config();

const isDev = process.env.NODE_ENV !== "production";
const src = path.join(__dirname, "src/client");
const build = path.join(__dirname, "build/client");

// Shared configs
const tsLoader = {
  test: /\.tsx?$/,
  use: [
    {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env", "@babel/preset-react"],
        overrides: [
          {
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "usage",
                  corejs: {
                    version: 3,
                    proposals: true,
                  },
                  targets: "last 2 chrome versions, last 2 firefox versions",
                },
              ],
            ],
            plugins: isDev ? ["react-hot-loader/babel"] : [],
          },
        ],
      },
    },
    {
      loader: "ts-loader",
      options: { transpileOnly: isDev },
    },
  ],
};

// Client config
module.exports = {
  name: "client",
  target: "web",
  entry: path.join(src, "index.tsx"),
  output: {
    path: build,
    filename: "script.js",
    publicPath: "/",
  },
  module: {
    rules: [tsLoader],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "react-dom": "@hot-loader/react-dom",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${src}/index.html`,
      title: "Reckless.tv",
      inject: true,
    }),
  ],
  stats: isDev ? "errors-warnings" : "normal",
  devServer: {
    historyApiFallback: true,
    compress: true,
    hot: true,
    proxy: {
      "/api/**": {
        target: `http://localhost:${process.env.PORT}`,
        secure: false,
        ws: true,
      },
      "/thumbnail/**": {
        target: `http://localhost:${process.env.PORT}`,
        secure: false,
      },
    },
  },
} as webpack.Configuration;
