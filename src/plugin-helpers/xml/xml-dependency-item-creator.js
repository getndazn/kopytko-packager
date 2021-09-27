const DependencyItem = require('../dependency/dependency-item');
const DependencyItemCreator = require('../dependency/dependency-item-creator');
const generateExternalModuleFileLocalPath = require('../module/generate-external-module-file-local-path');
const getModulePrefixByFilePath = require('../module/get-module-prefix-by-file-path');

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
   * @param {[matchString: String, scriptUri: String]} matchResult
   * @returns {DependencyItem}
   */
  create([_, scriptUri]) {
    const modulePrefix = getModulePrefixByFilePath(this._filePath);
    const isAbsoluteUri = scriptUri.includes(BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX);

    if (!modulePrefix && isAbsoluteUri) {
      return new DependencyItem(scriptUri, scriptUri);
    }

    const pathWithoutPrefix = (modulePrefix && isAbsoluteUri)
      ? generateExternalModuleFileLocalPath(scriptUri, modulePrefix)
      : this._filePath.replace(XML_FILE_NAME_REGEX, scriptUri);
    const dependencyPath = `${BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX}${pathWithoutPrefix}`;

    return new DependencyItem(dependencyPath, scriptUri);
  }
}
