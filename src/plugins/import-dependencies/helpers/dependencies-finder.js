module.exports = class DependenciesFinder {
  constructor(mapping) {
    this._mapping = mapping;
  }

  find(filePath) {
    if (!this._mapping[filePath]) {
      return [];
    }

    return this._findAllDependencies(filePath);
  }

  _findAllDependencies(filePath) {
    const allDependencies = [];
    const visited = new Set();
    const dependenciesToCheck = [...this._getSubDependencies(filePath)];
    let dependencyIndex = 0;

    while (dependencyIndex < dependenciesToCheck.length) {
      const dependency = dependenciesToCheck[dependencyIndex];
      dependencyIndex++;

      if (visited.has(dependency)) continue; // ← skip already-processed nodes
      visited.add(dependency);

      allDependencies.push(dependency);

      if (this._mapping[dependency]) {
        dependenciesToCheck.push(...this._getSubDependencies(dependency));
      }
    }

    return allDependencies;
  }

  _getSubDependencies(dependency) {
    return this._mapping[dependency].dependencies || [];
  }
}
