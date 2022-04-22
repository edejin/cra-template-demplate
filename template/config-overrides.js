const path = require('path');

module.exports = function override(config) {
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.alias,
      '@': path.resolve(__dirname, 'src'),
    },
  };
  let loaders = config.resolve
  loaders.fallback = {
    "fs": false,
    "tls": false,
    "net": false,
    "http": false, // require.resolve("stream-http"),
    "https": false,
    "zlib": false, // require.resolve("browserify-zlib") ,
    "path": require.resolve("path-browserify"),
    "stream": false, // require.resolve("stream-browserify"),
    "util": false, // require.resolve("util/"),
    "crypto": false, // require.resolve("crypto-browserify")
  }

  return config;
};
