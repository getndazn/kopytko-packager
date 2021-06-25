const DependencyItem = require('./dependency-item');

/**
 * DependencyItemCreator ia factory class for DependencyItem
 */
module.exports = class DependencyItemCreator {
  /**
   * Creates new DependencyItem from string match result.
   * Receives a String.prototype.match result as argument.
   * @param {Array<String>} dependencyParts 
   * @returns 
   */
  create(dependencyParts) {
    return new DependencyItem(dependencyParts.join(''));
  }
}
