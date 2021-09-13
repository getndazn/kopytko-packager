const flattenModuleTree = require('./flatten-module-tree');

module.exports = class Modules {
  _mainModuleName;
  _prefixMapping;
  _list;

  constructor(tree) {
    this._list = flattenModuleTree(tree);
    this._prefixMapping = Object.fromEntries(
      Object.entries(this._list).map(([name, details]) => [details.prefix, name])
    );

    const nonVersionedMainModuleName = Object.keys(tree)[0];
    this._mainModuleName = Object.keys(this._list).filter(prefix => prefix.includes(nonVersionedMainModuleName))[0];
  }

  get all() {
    return this._list;
  }

  get dependencies() {
    return Object.fromEntries(
      Object.entries(this._list).filter(([prefix, _]) => prefix !== this._mainModuleName)
    );
  }

  get main() {
    return this._list[this._mainModuleName];
  }

  getByPrefix(prefix) {
    return this._list[this._prefixMapping[prefix]];
  }
}
