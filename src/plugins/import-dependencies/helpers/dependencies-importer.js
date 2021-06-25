const sortUris = require('./sort-uris');

module.exports = class DependenciesImporter {
  _finder;
  _mapping;

  constructor(finder, mapping) {
    this._finder = finder;
    this._mapping = mapping;
  }

  import(dependencyPaths) {
    const dependencyPathsToAdd = this._findSubDependenciesToAdd(dependencyPaths);

    if (dependencyPathsToAdd.length) {
      sortUris(dependencyPathsToAdd);
    }

    return dependencyPathsToAdd;
  }

  _findSubDependenciesToAdd(dependencies) {
    const subDependencies = dependencies.reduce((allSubDependencies, dependency) => {
      return allSubDependencies.concat(this._finder.find(dependency));
    }, []);

    return [...new Set(subDependencies)].filter(subDependency => !dependencies.includes(subDependency));
  }
}
