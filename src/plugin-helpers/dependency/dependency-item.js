/**
 * DependencyItem represents one file dependency.
 */
module.exports = class DependencyItem {
  _importDefinition = null;
  _path = '';

  /**
   * Creates a dependency model.
   * @param {String} path
   */
  constructor(path, importDefinition = null) {
    this._importDefinition = importDefinition;
    this._path = path;
  }

  /**
   * Returns dependency path.
   * @returns {String}
   */
  get path() {
    return this._path;
  }

  /**
   * Returns dependency import definition
   * @returns {String|null}
   */
  get importDefinition() {
    return this._importDefinition;
  }
}
