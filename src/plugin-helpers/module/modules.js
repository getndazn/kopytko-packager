const flattenModuleTree = require('./flatten-module-tree');

module.exports = class Modules {
  mainPrefix;
  _list;

  constructor(tree) {
    this._list = flattenModuleTree(tree);

    const mainModuleName = Object.keys(tree)[0];
    this.mainPrefix = Object.keys(this._list).filter(prefix => prefix.includes(mainModuleName))[0];
  }

  get all() {
    return this._list;
  }

  get dependencies() {
    return Object.fromEntries(
      Object.entries(this._list)
        .filter(([prefix, _]) => prefix !== this.mainPrefix)
    );
  }
}
