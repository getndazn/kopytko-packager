const DependencyItem = require('../dependency/dependency-item');
const BrightscriptDependencyItemCreator = require('./brightscript-dependency-item-creator');
const generateExternalModuleFileLocalPath = require('./generate-external-module-file-local-path');

module.exports = class BrightscriptInternalDependencyItemCreator extends BrightscriptDependencyItemCreator {
  /**
   * Creates new DependencyItem from found brightscript dependency in brightscript file.
   * @param {[_: String, dependencyPath: String]} matchResult
   * @returns {DependencyItem}
   */
  create([_, dependencyPath]) {
    const appContextDependencyPath = (this.contextModulePrefix)
      ? generateExternalModuleFileLocalPath(dependencyPath, this.contextModulePrefix)
      : dependencyPath;

    return new DependencyItem(`${this.rootDir}${appContextDependencyPath}`);
  }
}
