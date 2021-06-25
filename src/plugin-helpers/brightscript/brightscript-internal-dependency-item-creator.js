const DependencyItem = require('../dependency/dependency-item');
const BrightscriptDependencyItemCreator = require('./brightscript-dependency-item-creator');
const generateExternalModuleFileLocalPath = require('./generate-external-module-file-local-path');

module.exports = class BrightscriptInternalDependencyItemCreator extends BrightscriptDependencyItemCreator {
  /**
   * The sanitized name of the context module. An empty string if it's the main app module.
   * Required for treating internal dependency annotation of external module as an external dependency
   * (from the app perspective).
   * @private
   * @type {String}
   */
  _contextSanitizedModuleName;

  /**
   * Creates an item creator for brightscript dependency items.
   * @param {String} [rootDir]
   * @param {String} [contextSanitizedModuleName]
   */
  constructor(rootDir = '', contextSanitizedModuleName = '') {
    super(rootDir);
    this._contextSanitizedModuleName = contextSanitizedModuleName;
  }

  /**
   * Creates new DependencyItem from found brightscript dependency in brightscript file.
   * @param {[_: String, dependencyPath: String]} matchResult
   * @returns {DependencyItem}
   */
  create([_, dependencyPath]) {
    const appContextDependencyPath = (this._contextSanitizedModuleName)
      ? generateExternalModuleFileLocalPath(dependencyPath, this._contextSanitizedModuleName)
      : dependencyPath;

    return new DependencyItem(`${this.rootDir}${appContextDependencyPath}`);
  }
}
