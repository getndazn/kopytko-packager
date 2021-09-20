const DependencyCollection = require('../dependency/dependency-collection');
const XmlDependencyFinder = require('./xml-dependency-finder');
const XmlDependencyItemCreator = require('./xml-dependency-item-creator');

module.exports = class XmlDependencies {
  _dependencyCollection;

  /**
   * Reads file lines and saves dependencies
   * @param {Array<String>} fileLines
   * @param {String} filePath
   * @param {String} [rootDir]
   */
  constructor(fileLines, filePath, rootDir = '') {
    this._dependencyCollection = this._createDependencyCollection(fileLines, filePath, rootDir);
  }

  /**
   * Returns dependency items
   * @returns {Array<DependencyItem>}
   */
  getItems() {
    return this._dependencyCollection.getItems();
  }

  /**
   * Returns the paths of dependency files defined in the xml file in scripts tags.
   * @returns {Array<String>}
   */
  getPaths() {
    return this._dependencyCollection.getPaths();
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
