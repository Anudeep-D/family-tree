import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const mode = IS_PRODUCTION ? "production" : "development";
export const entry = "./src/main.tsx";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const output = {
  filename: "bundle.js",
  path: path.resolve(__dirname, "dist"),
  clean: true,
  publicPath: "/", // Important for React Router
};
export const resolve = {
  extensions: [".tsx", ".ts", ".js"],
  alias: {
    "@": path.resolve(__dirname, "src"),
    "@styles": path.resolve(__dirname, "src/styles"),
    "@components": path.resolve(__dirname, "src/routes"), // Matches your Vite config
  },
};
export default {
  mode: mode,
  entry: entry,
  output: output,
  resolve: resolve,
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env'],
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.module\.s[ac]ss$/, // For CSS Modules
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { modules: true },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.s[ac]ss$/, // Global SCSS
        exclude: /\.module\.s[ac]ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/, // External CSS like xyflow
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
  devServer: {
    static: "./dist",
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
    client: {
      webSocketURL: 'ws://localhost:3000/ws',
    },
  },
};
