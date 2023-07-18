module.exports = function override(config, env) {
  // New config, e.g. config.plugins.push...
  // console.log(JSON.stringify(config.resolve.fallback))
  config.resolve.fallback = {
    crypto: require.resolve("crypto-browserify"),
    util: false,
    stream: require.resolve("stream-browserify"),
    ...config.resolve.fallback,
  };
  return config;
};
