module.exports = class DependenciesFinder {
  constructor(mapping) {
    this._mapping = mapping;
  }

  find(filePath) {
    if (!this._mapping[filePath]) {
      return [];
    }

    const fileDependencies = this._findAllDependencies(filePath);

    return [...new Set(fileDependencies)];
  }

  _findAllDependencies(filePath) {
    const allDependencies = [];
    const dependenciesToCheck = this._getSubDependencies(filePath);
    let dependencyIndex = 0;

    while (dependencyIndex < dependenciesToCheck.length) {
      let dependency = dependenciesToCheck[dependencyIndex];

      allDependencies.push(dependency);

      if (this._mapping[dependency]) {
        const subDependencies = this._getSubDependencies(dependency);
        dependenciesToCheck.push(...subDependencies);
      }

      dependencyIndex++;
    }

    return allDependencies;
  }

  _getSubDependencies(dependency) {
    return this._mapping[dependency].dependencies || [];
  }
}
