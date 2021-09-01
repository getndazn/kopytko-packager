const BrightscriptDependencyItemCreator = require('./brightscript-dependency-item-creator');
const DependencyItem = require('../dependency/dependency-item');
const generateExternalModuleFileLocalPath = require('./generate-external-module-file-local-path');

module.exports = class BrightscriptExternalDependencyItemCreator extends BrightscriptDependencyItemCreator {
  _modules;

  constructor(rootDir, contextModulePrefix, modules) {
    super(rootDir, contextModulePrefix);
    this._modules = modules;
  }

  /**
   * Creates new DependencyItem from found brightscript external dependency in brightscript file.
   * @param {[_: String, _statement: String, externalPath: String, moduleName: String]} matchResult
   * @returns {DependencyItem}
   */
  create([_, _statement, externalPath, moduleName]) {
    const contextModuleDependencies = this._modules.all[this.contextModulePrefix || this._modules.mainPrefix].dependencies;
    const versionedModuleName = contextModuleDependencies.filter(prefix => prefix.includes(moduleName))[0];
    const targetModulePrefix = this._modules.all[versionedModuleName].prefix;

    const localPath = generateExternalModuleFileLocalPath(externalPath, targetModulePrefix);

    return new DependencyItem(`${this.rootDir}${localPath}`);
  }
}
