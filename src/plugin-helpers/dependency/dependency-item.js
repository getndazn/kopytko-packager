/**
 * DependencyItem represents one file dependency.
 */
module.exports = class DependencyItem {
  _path = '';

  /**
   * Creates a dependency model.
   * @param {String} path 
   */
  constructor(path) {
    this._path = path;
  }

  /**
   * Returns dependency path.
   * @returns {String}
   */
  get path() {
    return this._path;
  }
}
