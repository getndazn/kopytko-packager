const fs = require('fs');
const path = require('path');

const config = require('../config');
const KopytkoError = require('../errors/kopytko-error');
const utils = require('../utils');

module.exports = class KopytkorcReader {
  _DEFAULT_ENV = 'dev';

  _kopytkorc;

  constructor() {
    this._kopytkorc = this._getKopytkorcConfig();
  }

  getArchivePath(env) {
    return this._getConfigField(env, "archivePath");
  }

  getSourceDir(env) {
    return this._getConfigField(env, "sourceDir");
  }

  getTempDir(env) {
    return this._getConfigField(env, "tempDir");
  }

  getManifestConfig(env) {
    const baseConfig = this._getBaseManifestConfig();
    const envManifestConfig = this._getEnvManifestConfig(env);
    const localManifestOverride = this._getLocalManifestConfig();

    if (!Object.entries(baseConfig).length) {
      throw new KopytkoError(`Check baseManifest file. It should not be empty.`);
    }

    return { baseConfig, envManifestConfig, localManifestOverride };
  }

  getEnvConfig(env) {
    const envConfig = this._kopytkorc.environments[env];

    if (!envConfig) {
      if (env === this._DEFAULT_ENV) {
        return {};
      }

      throw new KopytkoError(`There is no config defined for ${env} environment.`);
    }

    envConfig.plugins = this._normalizePlugins(envConfig.plugins, { postGlobalPlugin: false });

    return envConfig;
  }

  getGlobalPlugins() {
    return this._normalizePlugins(this._kopytkorc.plugins, { preEnvironmentPlugin: false });
  }

  getPluginDefinitions() {
    return this._kopytkorc.pluginDefinitions || {};
  }

  _getBaseManifestConfig() {
    return this._getManifestConfig(this._kopytkorc.baseManifest);
  }

  _getConfigField(env, configFieldNeme) {
    const envConfig = this.getEnvConfig(env);

    return envConfig[configFieldNeme] || this._kopytkorc[configFieldNeme] || config[configFieldNeme];
  }

  _getEnvManifestConfig(env) {
    const envConfig = this.getEnvConfig(env);

    if (!envConfig.manifest) {
      return {};
    }

    return this._getManifestConfig(envConfig.manifest);
  }

  _getLocalManifestConfig() {
    const defaultManifestFilePath = this._kopytkorc.localManifestOverride;

    try {
      return this._getManifestConfig(defaultManifestFilePath);
    } catch {
      return {}; // local manifest override is non-obligatory so we don't want to throw an exception when it doesn't exist
    }
  }

  _getKopytkorcConfig() {
    const kopytkorcPath = this._getAbsolutePath(config.kopytkorcFilename);

    if (!fs.existsSync(kopytkorcPath)) {
      throw new KopytkoError(`Create a packager config file in the root folder.`);
    }

    try {
      return JSON.parse(fs.readFileSync(kopytkorcPath, 'utf-8'));
    } catch (error) {
      throw new KopytkoError(`Packager config file couldn't be processed. Is it a proper JSON file?`, error);
    }
  }

  _getManifestConfig(configPath) {
    try {
      const configAbsolutePath = this._getAbsolutePath(configPath);
      const configFile = require(configAbsolutePath);

      return utils.isObject(configFile) ? configFile : {};
    } catch (error) {
      throw new KopytkoError(`Manifest config file ${configPath} couldn't be proccessed. Is it proper JSON file?`, error);
    }
  }

  _normalizePlugins(plugins = [], fallbackType) {
    return plugins.map((plugin, index) => {
      if (typeof plugin === 'string') {
        return { ...fallbackType, name: plugin };
      }

      if (!plugin.name) {
        throw new KopytkoError(`Plugin on index [${index}] needs a name!`);
      }

      return plugin;
    });
  }

  _getAbsolutePath(projectPath) {
    return path.join(process.env.PWD, projectPath);
  }
}
