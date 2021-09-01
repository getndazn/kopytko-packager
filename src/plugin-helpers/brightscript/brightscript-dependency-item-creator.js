const DependencyItemCreator = require('../dependency/dependency-item-creator');

const BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX = 'pkg:';

module.exports = class BrightscriptDependencyItemCreator extends DependencyItemCreator {
  /**
   * The prefix of the context module. An empty string if it's the main app module.
   * Required for treating internal dependency annotation of external module as an external dependency
   * (from the app perspective).
   * @protected
   * @type {String}
   */
  contextModulePrefix;

  /**
   * @protected
   */
  filePath;

  /**
   * @protected
   */
  rootDir;

  /**
   * Creates an item creator for brightscript dependency items.
   * @param {String} rootDir
   * @param {String} contextModulePrefix
   */
  constructor(rootDir, contextModulePrefix, filePath) {
    super();
    this.rootDir = rootDir || BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX;
    this.contextModulePrefix = contextModulePrefix;
    this.filePath = filePath;
  }
}
