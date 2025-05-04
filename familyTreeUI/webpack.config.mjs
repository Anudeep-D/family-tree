// ESM-style imports
import path from "path";
import { fileURLToPath } from "url";
import HtmlWebpackPlugin from "html-webpack-plugin";

// Determine if the build is for production
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Set mode based on environment
export const mode = IS_PRODUCTION ? "production" : "development";

// Entry point of the application (your React app starts here)
export const entry = "./src/main.tsx";

// Get __dirname in ESM environment (since __dirname isn't available natively in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output settings for bundled files
export const output = {
  filename: "bundle.js",                                 // Output filename for the JavaScript bundle
  path: path.resolve(__dirname, "dist"),                 // Output directory (absolute path)
  clean: true,                                           // Clean the output directory before each build
  publicPath: "/",                                       // Required for React Router (ensures proper routing)
};

// Resolve module imports
export const resolve = {
  extensions: [".tsx", ".ts", ".js"],                    // File extensions Webpack will resolve automatically
  alias: {
    "@": path.resolve(__dirname, "src"),                 // Use @ as alias for src
    "@styles": path.resolve(__dirname, "src/styles"),    // Alias for styles folder
    "@components": path.resolve(__dirname, "src/routes") // Alias matching Vite config
  },
};

// Main Webpack configuration object
export default {
  mode: mode,                 // Mode: development or production
  entry: entry,               // App entry point
  output: output,             // Output settings
  resolve: resolve,           // Path aliasing and extensions

  // Module rules define how different file types should be processed
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,             // Transpile JS, TS, and TSX files
        exclude: /node_modules/,            // Ignore dependencies
        use: {
          loader: 'babel-loader',           // Use Babel to transpile files
          options: {
            presets: [
              ['@babel/preset-env'],                       // Convert modern JS to older JS for compatibility
              ['@babel/preset-react', { runtime: 'automatic' }], // Handle JSX (new React 17+ transform)
              '@babel/preset-typescript',                 // Handle TypeScript
            ],
          },
        },
      },
      {
        test: /\.module\.s[ac]ss$/,         // For SCSS files using CSS modules (component-scoped styling)
        use: [
          "style-loader",                   // Inject CSS into DOM
          {
            loader: "css-loader",
            options: { modules: true },     // Enable CSS Modules
          },
          "sass-loader",                    // Compile SCSS to CSS
        ],
      },
      {
        test: /\.s[ac]ss$/,                 // Global SCSS files (not modules)
        exclude: /\.module\.s[ac]ss$/,      // Make sure not to double-process module files
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,                     // For plain CSS files (e.g., from node_modules like xyflow)
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  // Plugins enhance webpack's functionality
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",            // Base HTML template for the app
    }),
  ],

  // Development server settings
  devServer: {
    static: "./dist",                      // Serve content from the dist directory
    port: 3000,                            // Local dev server port
    open: true,                            // Automatically open browser on start
    hot: true,                             // Enable Hot Module Replacement
    compress: true,                        // Enable gzip compression
    historyApiFallback: true,             // Required for React Router (serves index.html on 404)
    client: {
      webSocketURL: 'ws://localhost:3000/ws', // Fixes WebSocket path for live reload
    },
  },
};
