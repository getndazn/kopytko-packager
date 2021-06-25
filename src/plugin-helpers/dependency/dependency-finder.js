/**
 * DependencyFinder provides a logic to find the desired dependency that matches the pattern.
 */
module.exports = class DependencyFinder {
  _dependencyItemCreator;
  _regexp;

  /**
   * Creates a finder instance to search for a dependency in a string.
   * @param {RegExp} regexp
   * @param {DependencyItemCreator} dependencyItemCreator
   */
  constructor(regexp, dependencyItemCreator) {
    this._dependencyItemCreator = dependencyItemCreator;
    this._regexp = regexp;
  }

  /**
   * Returns a DependencyItem if found one matching the regexp or undefined if found none.
   * @param {String} line
   * @returns {?DependencyItem}
   */
  find(line) {
    const match = line.match(this._regexp);
    if (match) {
      return this._dependencyItemCreator.create([...match]);
    }
  }
}
