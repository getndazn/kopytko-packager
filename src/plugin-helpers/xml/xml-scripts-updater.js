const XmlDependencyInjector = require('./xml-dependency-injector');
const FileHandler = require('../file-handler');
const DependencyCollection = require('../dependency/dependency-collection');
const getModulePrefixByFilePath = require('../module/get-module-prefix-by-file-path');

module.exports = class XmlScriptsUpdater {
  _fileLines;
  _filePath;
  _xmlDependencies;

  constructor(fileLines, filePath, xmlDependencies) {
    this._fileLines = fileLines;
    this._filePath = filePath;
    this._xmlDependencies = xmlDependencies;
  }

  /**
   * Adds given dependency paths in script tags to the xml file and rewrites absolute path if necessary.
   * @param {Array<String>} dependencyPathsToAdd
   * @returns {Promise<void>}
   */
  update(dependencyPathsToAdd) {
    if (this._updateAbsolutePaths() || this._updateFileDependencies(dependencyPathsToAdd)) {
      return FileHandler.writeLines(this._filePath, this._fileLines);
    }
  }

  _updateAbsolutePaths() {
    const modulePrefix = getModulePrefixByFilePath(this._filePath);
    if (!modulePrefix) {
      return false; // main module doesn't require paths update
    }

    let didReplaceAnyPath = false;

    this._xmlDependencies.getItems().forEach(dependencyItem => {
      const isAbsolutePath = dependencyItem.importDefinition.includes('pkg:');
      if (isAbsolutePath && dependencyItem.importDefinition !== dependencyItem.path) {
        const importLineIndex = this._fileLines.findIndex(line => line.includes(dependencyItem.importDefinition));
        if (importLineIndex >= -1) {
          didReplaceAnyPath = true;

          this._fileLines[importLineIndex] = this._fileLines[importLineIndex].replace(dependencyItem.importDefinition, dependencyItem.path);
        }
      }
    });

    return didReplaceAnyPath;
  }

  _updateFileDependencies(dependencyPathsToAdd) {
    if (!dependencyPathsToAdd.length) {
      return false;
    }

    const newDependencyCollection = new DependencyCollection(dependencyPathsToAdd);
    const dependencyInjector = new XmlDependencyInjector(this._fileLines);
    this._fileLines = dependencyInjector.inject(newDependencyCollection);

    return true;
  }
}
