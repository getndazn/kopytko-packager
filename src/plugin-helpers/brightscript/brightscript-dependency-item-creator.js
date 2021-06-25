const DependencyItemCreator = require('../dependency/dependency-item-creator');

const BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX = 'pkg:';

module.exports = class BrightscriptDependencyItemCreator extends DependencyItemCreator {
  rootDir; // protected

  /**
   * Creates an item creator for brightscript dependency items.
   * @param {String} [rootDir]
   */
  constructor(rootDir = '') {
    super();
    this.rootDir = rootDir || BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX;
  }
}
