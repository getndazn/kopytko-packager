const BrightscriptExternalDependencyItemCreator = require('./brightscript-external-dependency-item-creator');
const BrightscriptExternalImportFinder = require('./brightscript-external-import-finder');
const BrightscriptInternalDependencyItemCreator = require('./brightscript-internal-dependency-item-creator');
const BrightscriptInternalImportFinder = require('./brightscript-internal-import-finder');
const DependencyCollection = require('../dependency/dependency-collection');
const getModulePrefixByFilePath = require('../module/get-module-prefix-by-file-path');

const BRIGHTSCRIPT_COMMENT = '\'';

module.exports = class BrightscriptDependencies {
  _fileLines;
  _importDependencyCollection;
  _rootDir;

  /**
   * Reads file lines and saves dependencies
   * @param {Array<String>} fileLines
   * @param {String} filePath
   * @param {Modules} modules
   * @param {String} [rootDir]
   */
  constructor(fileLines, filePath, modules, rootDir = '') {
    this._fileLines = fileLines;
    this._rootDir = rootDir;
    this._filePath = filePath;
    this._modulePrefix = getModulePrefixByFilePath(filePath);

    const internalItemCreator = new BrightscriptInternalDependencyItemCreator(this._rootDir, this._modulePrefix, filePath);
    this._importDependencyCollection = this.getDependencyCollection(new BrightscriptInternalImportFinder(internalItemCreator));

    const externalItemCreator = new BrightscriptExternalDependencyItemCreator(this._rootDir, this._modulePrefix, filePath, modules);
    const externalImportDependencyCollection = this.getDependencyCollection(new BrightscriptExternalImportFinder(externalItemCreator));
    externalImportDependencyCollection.getItems().forEach(dependency => this._importDependencyCollection.add(dependency));
  }

  /**
   * Returns the paths of dependency files defined after the "@import" annotation.
   * @returns {Array<String>}
   */
  getImportPaths() {
    return this._importDependencyCollection.getPaths();
  }

  /**
   * @param {DependencyFinder} finder
   * @returns {DependencyCollection}
   * @protected
   */
  getDependencyCollection(finder) {
    const dependencyCollection = new DependencyCollection();

    this._forEachCommentLine(line => {
      const dependencyItem = finder.find(line);

      if (dependencyItem) {
        dependencyCollection.add(dependencyItem);
      }
    });

    return dependencyCollection;
  }

  _forEachCommentLine(lineProcessor) {
    for (const line of this._fileLines) {
      const trimmedLine = line.trim();
      const isCommentLine = trimmedLine.startsWith(BRIGHTSCRIPT_COMMENT);
      if (!isCommentLine && trimmedLine) {
        break;
      }

      if (isCommentLine) {
        lineProcessor(line);
      }
    }
  }
}
