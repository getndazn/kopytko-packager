const buildModuleTree = require('./build-module-tree');
const Modules = require('./modules');

module.exports = function buildModules() {
  const moduleTree = buildModuleTree();

  return new Modules(moduleTree);
}
