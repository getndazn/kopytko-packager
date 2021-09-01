const fs = require('fs-extra');
const path = require('path');

const buildModules = require('../../plugin-helpers/module/build-modules');
const { externalModulesDirName } = require('../../config');

module.exports = function copyDependencies(dir) {
  const modules = buildModules();

  return Promise.all(
    Object.keys(modules.dependencies)
      .map(name => copyModule(name, modules.dependencies[name], dir))
  );
}

const copyModule = async (moduleName, moduleDetails, tempDir) => {
  const [wasComponentsDirCopied, wasSourceDirCopied] = await Promise.all([
    copyModuleDir(moduleDetails, 'components', tempDir),
    copyModuleDir(moduleDetails, 'source', tempDir),
  ]);

  if (!wasComponentsDirCopied && !wasSourceDirCopied) {
    throw new Error(`'${moduleName}' is an invalid Kopytko Module because it has neither /components nor /source
      directory in its '${moduleDetails.kopytkoModuleDir}' source directory. Please verify it or get rid of this dependency.`);
  }
}

const copyModuleDir = async (moduleDetails, dir, tempDir) => {
  const sourceDir = path.join(moduleDetails.dir, moduleDetails.kopytkoModuleDir, dir);
  const targetDir = path.join(tempDir, dir, externalModulesDirName, moduleDetails.prefix);

  const doesSourceDirExist = await fs.pathExists(sourceDir);
  if (!doesSourceDirExist) {
    return Promise.resolve(false);
  }

  await fs.copy(sourceDir, targetDir);

  return Promise.resolve(true);
};
