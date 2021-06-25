const DependencyCollection = require('../dependency/dependency-collection');
const XmlDependencyFinder = require('./xml-dependency-finder');
const XmlDependencyInjector = require('./xml-dependency-injector');
const XmlDependencyItemCreator = require('./xml-dependency-item-creator');

module.exports = class XmlDependencies {
  _dependencyCollection;
  _dependencyInjector;

  /**
   * Reads file lines and saves dependencies
   * @param {Array<String>} fileLines
   * @param {String} filePath
   * @param {String} [rootDir]
   */
  constructor(fileLines, filePath, rootDir = '') {
    this._dependencyCollection = this._createDependencyCollection(fileLines, filePath, rootDir);
    this._dependencyInjector = new XmlDependencyInjector(fileLines);
  }

  /**
   * Returns the paths of dependency files defined in the xml file in scripts tags.
   * @returns {Array<String>}
   */
  getDependencyPaths() {
    return this._dependencyCollection.getPaths();
  }

  /**
   * Adds given dependency paths in script tags to the xml file and returns updated lines.
   * @param {Array<String>} dependencyPaths
   * @returns {Array<String>}
   */
  updateFileDependencies(dependencyPaths) {
    const newDepdendencyCollection = new DependencyCollection(dependencyPaths);
    const updatedFileLines = this._dependencyInjector.inject(newDepdendencyCollection);

    return updatedFileLines;
  }

  _createDependencyCollection(fileLines, filePath, rootDir) {
    const dependencyCollection = new DependencyCollection();
    const dependencyItemCreator = new XmlDependencyItemCreator(filePath, rootDir);
    const dependencyFinder = new XmlDependencyFinder(dependencyItemCreator);

    fileLines.forEach(line => {
      let dependencyPath = dependencyFinder.find(line);

      if (dependencyPath) {
        dependencyCollection.add(dependencyPath);
      }
    });

    return dependencyCollection;
  }
}
