const webpack = require("webpack");

module.exports = function override(config, env) {
  // New config, e.g. config.plugins.push...
  // console.log(JSON.stringify(config.resolve.fallback))
  config.resolve.fallback = {
    buffer: require.resolve("buffer"),
    crypto: require.resolve("crypto-browserify"),
    util: false,
    stream: require.resolve("stream-browserify"),
    ...config.resolve.fallback,
  };
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ];
  return config;
};
