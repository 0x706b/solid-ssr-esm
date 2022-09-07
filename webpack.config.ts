import type { Configuration } from "webpack";

import path from "node:path";
import url from "node:url";
import hmr from "webpack";
import RouteManifestPlugin from "webpack-route-manifest";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

const mode          = process.env.NODE_ENV === "production" ? "production" : "development";
const isDevelopment = mode === "development";

const sharedPlugins = [
  new RouteManifestPlugin({
    inline: false,
    filename: "route-manifest.json",
    routes: (file) => {
      file = file.replace(path.join(dirname, "../src"), "").replace(/\.[tj]sx?$/, "");

      if (!file.includes("/pages/")) return "*";
      const name = "/" + file.replace("./pages/", "").toLowerCase();
      return name === "/home" ? "/" : name;
    },
  }),
];

const devPlugins = [new hmr.HotModuleReplacementPlugin({})];

const plugins = isDevelopment ? [...sharedPlugins, ...devPlugins] : sharedPlugins;

const main = isDevelopment ? ["webpack-hot-middleware/client", "./src/client.tsx"] : ["./src/client.tsx"];

const contentHash = isDevelopment ? "" : "?v=[contenthash:8]";

const client: Configuration = {
  mode,
  entry: { main },
  output: {
    path: path.resolve(dirname, "./dist"),
    filename: `[name].js${contentHash}`,
    chunkFilename: `[name].chunk.js${contentHash}`,
    publicPath: "/",
  },
  devtool: isDevelopment ? "inline-source-map" : undefined,
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [["solid", { generate: "dom", hydratable: true }]],
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: [...(isDevelopment ? [["solid-refresh/babel", { bundler: "webpack5" }]] : [])],
              presets: [["solid", { generate: "dom", hydratable: true }]],
            },
          },
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".jsx": [".tsx", ".jsx"],
    },
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  plugins,
};

export default client;
