const path = require('path');

const APP_MODULE_NAME = 'app';
const DEPENDENCY_DIR_NAME = 'roku_modules';

module.exports = function generateExternalModuleFileLocalPath(internalPath, sanitizedModuleName) {
  if (!sanitizedModuleName || sanitizedModuleName === APP_MODULE_NAME) {
    return internalPath;
  }

  const pathParts = internalPath.split(path.sep).slice(1); // slice to remove the leading path separator
  const mainDir = path.sep + pathParts.shift();
  const remainingPath = pathParts.join(path.sep);

  return `${mainDir}${path.sep}${DEPENDENCY_DIR_NAME}${path.sep}${sanitizedModuleName}${path.sep}${remainingPath}`;
}
