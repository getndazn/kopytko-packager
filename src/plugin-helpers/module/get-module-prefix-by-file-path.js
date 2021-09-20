const path = require('path');
const { externalModulesDirName } = require('../../config');

module.exports = function getModulePrefixByFilePath(filePath) {
  const pathParts = filePath.split(path.sep);
  const externalModulesCatalogNameIndex = pathParts.indexOf(externalModulesDirName);
  if (externalModulesCatalogNameIndex < 0) {
    return null;
  }

  return pathParts[externalModulesCatalogNameIndex + 1];
}
