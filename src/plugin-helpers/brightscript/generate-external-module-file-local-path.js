const path = require('path');

const { externalModulesDirName } = require('../../config');

module.exports = function generateExternalModuleFileLocalPath(internalPath, modulePrefix) {
  if (!modulePrefix) {
    return internalPath;
  }

  const pathParts = internalPath.split(path.sep).slice(1); // slice to remove the leading path separator
  const mainDir = path.sep + pathParts.shift();
  const remainingPath = pathParts.join(path.sep);

  return `${mainDir}${path.sep}${externalModulesDirName}${path.sep}${modulePrefix}${path.sep}${remainingPath}`;
}
