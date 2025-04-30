/* config-overrides.js */
const path = require('path');

module.exports = function override(config, env) {
  // Отключаем плагин case-sensitive-paths-webpack-plugin
  config.plugins = config.plugins.filter(
    plugin => !plugin.constructor || plugin.constructor.name !== 'CaseSensitivePathsPlugin'
  );
  
  return config;
}; 