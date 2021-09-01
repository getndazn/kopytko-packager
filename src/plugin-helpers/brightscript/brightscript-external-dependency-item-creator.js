const BrightscriptDependencyItemCreator = require('./brightscript-dependency-item-creator');
const DependencyItem = require('../dependency/dependency-item');
const generateExternalModuleFileLocalPath = require('./generate-external-module-file-local-path');

module.exports = class BrightscriptExternalDependencyItemCreator extends BrightscriptDependencyItemCreator {
  _modules;

  constructor(rootDir, contextModulePrefix, filePath, modules) {
    super(rootDir, contextModulePrefix, filePath);
    this._modules = modules;
  }

  /**
   * Creates new DependencyItem from found brightscript external dependency in brightscript file.
   * @param {[_: String, _statement: String, externalPath: String, moduleName: String]} matchResult
   * @returns {DependencyItem}
   */
  create([_, _statement, externalPath, moduleName]) {
    const contextModule = this.contextModulePrefix ? this._modules.getByPrefix(this.contextModulePrefix) : this._modules.main;
    const contextModuleDependencies = contextModule.dependencies;
    const versionedModuleName = contextModuleDependencies.filter(prefix => prefix.includes(moduleName))[0];
    if (!versionedModuleName) {
      throw new Error(`${this.filePath} file is trying to import unmet ${moduleName} dependency module`);
    }

    const targetModulePrefix = this._modules.all[versionedModuleName].prefix;
    const localPath = generateExternalModuleFileLocalPath(externalPath, targetModulePrefix);

    return new DependencyItem(`${this.rootDir}${localPath}`);
  }
}
