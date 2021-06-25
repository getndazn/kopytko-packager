const path = require('path');

const BrightscriptExternalDependencyItemCreator = require('./brightscript-external-dependency-item-creator');
const BrightscriptExternalImportFinder = require('./brightscript-external-import-finder');
const BrightscriptInternalDependencyItemCreator = require('./brightscript-internal-dependency-item-creator');
const BrightscriptInternalImportFinder = require('./brightscript-internal-import-finder');
const DependencyCollection = require('../dependency/dependency-collection');

const BRIGHTSCRIPT_COMMENT = '\'';
const EXTERNAL_MODULES_CATALOG_NAME = 'roku_modules';

module.exports = class BrightscriptDependencies {
  _fileLines;
  _importDependencyCollection;
  _sanitizedModuleName = null;
  _rootDir;

  /**
   * Reads file lines and saves dependencies
   * @param {Array<String>} fileLines
   * @param {String} filePath
   * @param {String} [rootDir]
   */
  constructor(fileLines, filePath, rootDir = '') {
    this._fileLines = fileLines;
    this._rootDir = rootDir;
    this._filePath = filePath;
    this._sanitizedModuleName = this._getSanitizedModuleNameOfFile(filePath);

    const internalItemCreator = new BrightscriptInternalDependencyItemCreator(this._rootDir, this._sanitizedModuleName);
    this._importDependencyCollection = this.getDependencyCollection(new BrightscriptInternalImportFinder(internalItemCreator));

    const externalItemCreator = new BrightscriptExternalDependencyItemCreator(this._rootDir);
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

  _getSanitizedModuleNameOfFile(filePath) {
    const pathParts = filePath.split(path.sep);
    const externalModulesCatalogNameIndex = pathParts.indexOf(EXTERNAL_MODULES_CATALOG_NAME);
    if (externalModulesCatalogNameIndex < 0) {
      return null;
    }

    return pathParts[externalModulesCatalogNameIndex + 1];
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
