const DependencyFinder = require('../dependency/dependency-finder');

const BRIGHTSCRIPT_EXTERNAL_IMPORT_REGEX = /^\s*'\s*@import\s+(?:pkg:)?((\/[\w-/.]+\.brs)\s+from\s+([\w-/.@!]+))\s*$/;

module.exports = class BrightscriptExternalImportFinder extends DependencyFinder {
  /**
   * Creates a finder for external dependencies imported with @import annotation.
   * @param {BrightscriptDependencyItemCreator} dependencyItemCreator
   */
  constructor(importItemCreator) {
    super(BRIGHTSCRIPT_EXTERNAL_IMPORT_REGEX, importItemCreator);
  }
}
