module.exports = function flattenModuleTree(modules) {
  const moduleList = {};

  flattenModules(modules, moduleList);

  return moduleList;
}

const flattenModules = (modules, list) => Object.entries(modules)
  .forEach(([name, details]) => {
    const versionedModuleName = `${name}@v${details.version.major}`;

    if (!list[versionedModuleName] || (list[versionedModuleName].version.minor < details.version.minor)) {
      list[versionedModuleName] = {
        dependencies: Object.entries(details.dependencies).map(([name, details]) => `${name}@v${details.version.major}`),
        dir: details.dir,
        prefix: details.prefix,
        version: details.version,
      };

      flattenModules(details.dependencies, list);
    }
  });
