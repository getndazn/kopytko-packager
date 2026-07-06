const { glob } = require('glob');
const path = require('path');

const KopytkoError = require('../../../errors/kopytko-error');
const BrightscriptDependencies = require('../../../plugin-helpers/brightscript/brightscript-dependencies');
const FileHandler = require('../../../plugin-helpers/file-handler');

const BATCH_SIZE = 50;
const BRIGHTSCRIPT_FILE_PATH_PATTERN = '/components/**/*.brs';
const BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX = 'pkg:';

module.exports = class DependenciesMappingGenerator {
  _modules;

  constructor(modules) {
    this._modules = modules;
  }

  async generate(dir) {
    const brsFilePaths = await glob(path.join(dir, BRIGHTSCRIPT_FILE_PATH_PATTERN), {});
    const mapping = {};

    for (let i = 0; i < brsFilePaths.length; i += BATCH_SIZE) {
      const batch = brsFilePaths.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (filePath) => ({
          uri: filePath.replace(dir, BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX),
          importPaths: (await this._getBrightscriptDependencies(filePath)).getImportPaths(),
        }))
      );

      for (const { uri, importPaths } of batchResults) {
        this._checkCircularDependency(mapping, importPaths, uri);
        mapping[uri] = { dependencies: importPaths };
      }
    }

    return mapping;
  }

  async _getBrightscriptDependencies(filePath) {
    const fileLines = await FileHandler.readLines(filePath);

    return new BrightscriptDependencies(fileLines, filePath, this._modules);
  }

  _checkCircularDependency(mapping, fileImportPaths, fileUri) {
    if (fileImportPaths.length) {
      const circularDependency = fileImportPaths
        .find(importPath => mapping[importPath] && mapping[importPath].dependencies.includes(fileUri));

      if (circularDependency) {
        throw new KopytkoError(`Circular dependencies found: ${fileUri} and ${circularDependency}!`);
      }
    }
  }
}
