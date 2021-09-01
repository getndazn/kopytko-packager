const path = require('path');

const getSemVerObject = require('./get-semver-object');
const getNpmList = require('./get-npm-list');
const getModulePrefix = require('../get-module-prefix');
const defaultKopytkoConfig = require('../../config');
const FileHandler = require('../file-handler');

module.exports = function buildModuleTree() {
  const mainModuleInfo = getMainModuleInfo();
  const prodDependencies = getProdDependencies();
  const devDependencies = getDevDependencies(prodDependencies);

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

const getDevDependencies = (prodDependencies) => {
  const devDependencies = {};

  const npmList = getNpmList({ prodOnly: false, depth: 0 })
  const directDependencies = npmList.dependencies;
  const directDevDependenciesName = Object.keys(directDependencies).filter(name => !prodDependencies[name]);

  directDevDependenciesName.forEach(name => {
    const cwd = getModuleDir(process.env.PWD, name);
    const dependencyNpmList = getNpmList({ cwd });
    const devDependency = mapDependency(name, dependencyNpmList);
    if (devDependency) {
      devDependencies[name] = devDependency;
    }
  })

  return devDependencies;
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
  const dir = findDir(name, parentDir);
  const kopytkoModuleDir = getKopytkoModuleDir(dir);
  if (!kopytkoModuleDir) {
    return null;
  }

  const version = getSemVerObject(details.version);

  return {
    dir,
    kopytkoModuleDir,
    version,
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

const getKopytkoModuleDir = (dir) => {
  try {
    const kopytkorc = FileHandler.readSync(path.join(dir, '.kopytkorc'));
    const config = JSON.parse(kopytkorc);

    return config.sourceDir || defaultKopytkoConfig.sourceDir;
  } catch {
    return null;
  }
}
