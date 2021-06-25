const DependencyItem = require('../dependency/dependency-item');
const DependencyItemCreator = require('../dependency/dependency-item-creator');

const BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX = 'pkg:';
const XML_FILE_NAME_REGEX = /[^/]+.xml/;

module.exports = class XmlDependencyItemCreator extends DependencyItemCreator {
  _filePath;

  /**
   * Creates an item creator for xml dependency items.
   * @param {String} filePath
   * @param {String} [rootDir]
   */
  constructor(filePath, rootDir = '') {
    super();
    this._filePath = filePath.replace(rootDir, '');
  }

  /**
   * Creates new DependencyItem from found brightscript dependency in xml file.
   * @param {[matchString: String, prefix: ?String, path: String]} matchResult
   * @returns {DependencyItem}
   */
  create([_, prefix = '', path]) {
    const dependencyPath = prefix ?
      `${prefix}${path}` :
      `${BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX}${this._filePath.replace(XML_FILE_NAME_REGEX, path)}`;

    return new DependencyItem(dependencyPath);
  }
}
