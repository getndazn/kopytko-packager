const fs = require('fs-extra');
const KopytkoError = require('../errors/kopytko-error');

const Archiver = require('./archiver');

module.exports = class PackageBuilder {
  _env;
  _sourceDir;
  _tempDir;

  constructor({ env, sourceDir, tempDir }) {
    this._env = env;
    this._sourceDir = sourceDir;
    this._tempDir = tempDir;
  }

  async createTemporaryFiles() {
    await fs.emptyDir(this._tempDir);
    await fs.copy(this._sourceDir, this._tempDir);
  }

  async applyPlugins(plugins, prePluginCallback = null) {
    try {
      for (const { name, plugin } of plugins) {
        prePluginCallback && prePluginCallback(name);
        await plugin(this._tempDir, this._env);
      }
    } catch (error) {
      throw new KopytkoError('Plugin caused an error', error);
    }
  }

  archive(archivePath) {
    return new Archiver().archive(archivePath, this._tempDir);
  }

  removeTemporaryFiles() {
    return fs.remove(this._tempDir);
  }
}
