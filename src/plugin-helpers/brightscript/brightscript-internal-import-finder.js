const DependencyFinder = require('../dependency/dependency-finder');

const BRIGHTSCRIPT_INTERNAL_IMPORT_REGEX = /^\s*'\s*@import\s+(?:pkg:)?(\/[\w-/.]+\.brs)\s*$/;

module.exports = class BrightscriptInternalImportFinder extends DependencyFinder {
  /**
   * Creates a finder for dependencies imported with @import annotation.
   * @param {BrightscriptDependencyItemCreator} dependencyItemCreator
   */
  constructor(importItemCreator) {
    super(BRIGHTSCRIPT_INTERNAL_IMPORT_REGEX, importItemCreator);
  }
}
