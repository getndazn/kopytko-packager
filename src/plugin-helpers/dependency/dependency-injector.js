/**
 * DependencyInjector provides functionality to inject new file dependencies.
 */
module.exports = class DependencyInjector {
  _fileLines;

  /**
   * Creates a new instance for file lines given.
   * @param {Array<String>} fileLines
   */
  constructor(fileLines) {
    this._fileLines = fileLines;
  }

  /**
   * Returns changed file lines that includes new dependencies.
   * @param {DependencyColection} dependencyCollection
   * @returns {Array<String>}
   */
  inject(_) {
    return this._fileLines;
  }
}
