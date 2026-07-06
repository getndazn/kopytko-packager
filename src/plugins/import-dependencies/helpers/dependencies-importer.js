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
    const existingDependencies = new Set(dependencies);
    const seen = new Set();
    const subDependencies = [];

    for (const dependency of dependencies) {
      for (const found of this._finder.find(dependency)) {
        if (!existingDependencies.has(found) && !seen.has(found)) {
          seen.add(found);
          subDependencies.push(found); // ← single array, no copies, deduped inline
        }
      }
    }

    return subDependencies;
  }
}
