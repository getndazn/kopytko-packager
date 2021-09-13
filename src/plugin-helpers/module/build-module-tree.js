const path = require('path');

const getSemVerObject = require('./get-semver-object');
const getNpmList = require('./get-npm-list');
const getModulePrefix = require('../get-module-prefix');
const FileHandler = require('../file-handler');

const KOPYTKO_MODULE_KEYWORD = 'kopytko-module';
const KOPYTKO_MODULE_DIR_KEY = 'kopytkoModuleDir';

module.exports = function buildModuleTree() {
  const mainModuleInfo = getMainModuleInfo();
  const prodDependencies = getProdDependencies();
  const devDependencies = getDirectDevDependencies();

  return {
    [mainModuleInfo.name]: {
      version: getSemVerObject(mainModuleInfo.version),
      dependencies: { ...prodDependencies, ...devDependencies },
    },
  };
}

const getMainModuleInfo = () => {
  const { name, version } = getNpmList({ depth: 0 });

  return { name, version };
}

const getProdDependencies = () => {
  const dependencies = getNpmList().dependencies;

  return mapDependencies(dependencies);
}

const getDirectDevDependencies = () => {
  const directDependencies = getNpmList({ prodOnly: false, depth: 0 }).dependencies;

  return mapDependencies(directDependencies);
}

const mapDependencies = (dependenciesDetails, parentDir = null) => {
  const dependencies = {};

  for (const name in dependenciesDetails) {
    const dependency = mapDependency(name, dependenciesDetails[name], parentDir);
    if (dependency) {
      dependencies[name] = dependency;
    }
  }

  return dependencies;
};

const mapDependency = (name, details, parentDir) => {
  const npmPackageDir = findDir(name, parentDir);

  const packageJson = FileHandler.readSync(path.join(npmPackageDir, 'package.json'));
  const packageInfo = JSON.parse(packageJson);
  if (!(packageInfo.keywords || []).includes(KOPYTKO_MODULE_KEYWORD)) {
    return null; // it's not a Kopytko Module
  }

  const version = getSemVerObject(details.version);

  return {
    version,
    dir: path.join(npmPackageDir, packageInfo[KOPYTKO_MODULE_DIR_KEY] || ''),
    dependencies: details.dependencies ? mapDependencies(details.dependencies, dir) : {},
    prefix: getModulePrefix(name, version.major),
  }
};

const findDir = (name, parentDir) => {
  if (parentDir) {
    const nestedDir = getModuleDir(parentDir, name);
    if (FileHandler.exists(path.join(nestedDir, 'package.json'))) {
      return nestedDir;
    }
  }

  return getModuleDir(process.env.PWD, name);
}

const getModuleDir = (parentDir, name) => path.join(parentDir, 'node_modules/', name);
