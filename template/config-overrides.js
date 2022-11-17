const path = require('path');
const {addBabelPlugin} = require('customize-cra');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = function override(config, env) {
  let isDev = env === 'development';

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

  if (isDev) {
    addBabelPlugin([
      'babel-plugin-styled-components',
      {
        displayName: true,
        fileName: true,
        minify: false
      },
    ])(config);
  } else {
    config.plugins.push(
      new WebpackObfuscator ({
      }, [
        // 'excluded_bundle_name.js'
      ])
    )
  }

  return config;
};
