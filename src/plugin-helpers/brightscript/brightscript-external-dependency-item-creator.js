const { util: ropmUtil } = require('ropm/dist/util');

const BrightscriptDependencyItemCreator = require('./brightscript-dependency-item-creator');
const DependencyItem = require('../dependency/dependency-item');
const generateExternalModuleFileLocalPath = require('./generate-external-module-file-local-path');

module.exports = class BrightscriptExternalDependencyItemCreator extends BrightscriptDependencyItemCreator {
  /**
   * Creates new DependencyItem from found brightscript external dependency in brightscript file.
   * @param {[_: String, _statement: String, externalPath: String, moduleName: String]} matchResult
   * @returns {DependencyItem}
   */
  create([_, _statement, externalPath, moduleName]) {
    const sanitizedModuleName = ropmUtil.getRopmNameFromModuleName(moduleName);
    const localPath = generateExternalModuleFileLocalPath(externalPath, sanitizedModuleName);

    return new DependencyItem(`${this.rootDir}${localPath}`);
  }
}
