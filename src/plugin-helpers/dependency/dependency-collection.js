const DependencyItem = require('./dependency-item');

/**
 * DependencyCollection represents set of file dependencies.
 */
module.exports = class DependencyCollection {
  _dependencyItems = new Set();

  /**
   * Creates a DependencyCollection.
   * Array of dependency paths can be given as well as array of DependencyItem objects.
   * @param {Array<String>|Array<DependencyItem>} [dependencyPathsOrItems]
   */
  constructor(dependencyPathsOrItems = []) {
    const uniqueDependencyPathsOrItems = new Set(dependencyPathsOrItems);
    const uniqueDependencyItems = [...uniqueDependencyPathsOrItems].map(this._normalizeDependencyItem);
    this._dependencyItems = new Set(uniqueDependencyItems);
  }

  /**
   * Adds a new dependency to the collection.
   * @param {String|DependencyItem} dependencyPathOrItem
   */
  add(dependencyPathOrItem) {
    const dependencyItem = this._normalizeDependencyItem(dependencyPathOrItem);
    this._dependencyItems.add(dependencyItem);
  }

  getItems() {
    return this._dependencyItems;
  }

  /**
   * Returns dependency paths array.
   * @returns {Array<String>}
   */
  getPaths() {
    return [...this._dependencyItems].map(dependencyItem => dependencyItem.path);
  }

  _normalizeDependencyItem(dependencyPathOrItem) {
    if (dependencyPathOrItem instanceof DependencyItem) {
      return dependencyPathOrItem;
    }

    return new DependencyItem(dependencyPathOrItem);
  }
}
