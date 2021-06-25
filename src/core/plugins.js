const path = require('path');

const { pluginDefinitions, pluginNames } = require('../env/kopytko-config');
const KopytkoError = require('../errors/kopytko-error');

module.exports = class Plugins {
  _OPTIONAL_CORE_PLUGIN_DEFINITIONS = {
    'kopytko-copy-external-dependencies': '../plugins/copy-external-dependencies/copy-external-dependencies.js',
    'kopytko-import-dependencies': '../plugins/import-dependencies/import-dependencies.js',
  };
  _REQUIRED_CORE_PLUGIN_DEFINITIONS = {
    'kopytko-generate-manifest': '../plugins/generate-manifest/generate-manifest.js',
  };

  _plugins;

  constructor({ rootDir }) {
    const requiredCorePlugins = this._getRequiredCorePlugins();
    const projectPlugins = this._getProjectPlugins(rootDir);

    this._plugins = [...projectPlugins, ...requiredCorePlugins];
  }

  [Symbol.iterator]() {
    let index = 0;

    return {
      next: () => {
        if (this._plugins.length > index) {
          const { name, path } = this._plugins[index++];
          const plugin = require(path);

          return {
            value: { name, plugin },
            done: false,
          };
        }

        return { done: true };
      },
    };
  }

  _getProjectPlugins(rootDir) {
    return pluginNames.map(name => {
      const pluginPath = pluginDefinitions[name] || this._OPTIONAL_CORE_PLUGIN_DEFINITIONS[name];

      if (!pluginPath) {
        throw new KopytkoError(`Path for plugin ${name} is not defined!`);
      }

      return {
        name,
        path: path.join(pluginDefinitions[name] ? rootDir : '', pluginPath),
      };
    });
  }

  _getRequiredCorePlugins() {
    return Object.keys(this._REQUIRED_CORE_PLUGIN_DEFINITIONS).map(name => ({
      name,
      path: this._REQUIRED_CORE_PLUGIN_DEFINITIONS[name],
    }));
  }
}
