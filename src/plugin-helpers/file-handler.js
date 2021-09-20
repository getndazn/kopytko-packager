const fs = require('fs');

/**
 * File common utilities.
 * @type {FileHandler}
 */
module.exports = class FileHandler {
  static FILE_ENCODING = 'utf8';
  static NEW_LINE_CHAR = '\n';

  /**
   * Checks if a file with the given path exists.
   * @param {String} filePath
   * @returns {Boolean}
   */
  static exists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Returns a content of the file from the given path.
   * @param {String} filePath - path to the file
   * @returns {Promise<String>}
   */
  static async read(filePath) {
    return fs.promises.readFile(filePath, this.FILE_ENCODING);
  }

  /**
   * Returns a content of the file from the given path.
   * @param {String} filePath - path to the file
   * @returns {String}
   */
  static readSync(filePath) {
    return fs.readFileSync(filePath, this.FILE_ENCODING);
  }

  /**
   * Returns lines of the file content from the given path.
   * @param {String} filePath - path to the file
   * @returns {Promise<Array<String>>}
   */
  static async readLines(filePath) {
    const fileContent = await this.read(filePath);

    return fileContent.split(this.NEW_LINE_CHAR);
  }

  /**
   * Writes the given content string to the given file path.
   * Resolves with undefined on success.
   * @param {String} filePath
   * @param {String} content
   * @returns {Promise<void>}
   */
  static write(filePath, content) {
    return fs.promises.writeFile(filePath, content, this.FILE_ENCODING);
  }

  /**
   * Writes the given content lines to the given file path.
   * Resolves with undefined on success.
   * @param {String} filePath
   * @param {Array<String>} lines
   * @returns {Promise<void>}
   */
  static writeLines(filePath, lines) {
    const newContent = lines.join(this.NEW_LINE_CHAR)

    return this.write(filePath, newContent);
  }
}
