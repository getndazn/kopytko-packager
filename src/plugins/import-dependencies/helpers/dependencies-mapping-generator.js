const glob = require('glob-promise');
const path = require('path');

const KopytkoError = require('../../../errors/kopytko-error');
const BrightscriptDependencies = require('../../../plugin-helpers/brightscript/brightscript-dependencies');
const FileHandler = require('../../../plugin-helpers/file-handler');

const BRIGHTSCRIPT_FILE_PATH_PATTERN = '/components/**/*.brs';
const BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX = 'pkg:';

module.exports = class DependenciesMappingGenerator {
  async generate(dir) {
    const brsFilePaths = await glob(path.join(dir, BRIGHTSCRIPT_FILE_PATH_PATTERN), {});
    const filesImportPaths = await Promise.all(
      brsFilePaths.map(async filePath => (await this._getBrightscriptDependencies(filePath)).getImportPaths())
    );
    const mapping = {};

    brsFilePaths
      .map(path => path.replace(dir, BRIGHTSCRIPT_LOCAL_DEPENDENCY_PREFIX))
      .forEach((brsFileUri, index) => {
        const fileImportPaths = filesImportPaths[index];

        this._checkCircularDependency(mapping, fileImportPaths, brsFileUri);

        mapping[brsFileUri] = {
          dependencies: fileImportPaths,
        };
      });

    return mapping;
  }

  async _getBrightscriptDependencies(filePath) {
    const fileLines = await FileHandler.readLines(filePath);

    return new BrightscriptDependencies(fileLines, filePath);
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
