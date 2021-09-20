const glob = require('glob-promise');
const path = require('path');

const FileHandler = require('../../plugin-helpers/file-handler');
const XmlScriptsUpdater = require('../../plugin-helpers/xml/xml-scripts-updater');
const XmlDependencies = require('../../plugin-helpers/xml/xml-dependencies');
const DependenciesFinder = require('./helpers/dependencies-finder');
const DependenciesImporter = require('./helpers/dependencies-importer');
const DependenciesMappingGenerator = require('./helpers/dependencies-mapping-generator');
const buildModules = require('../../plugin-helpers/module/build-modules');

const XML_FILE_PATH_PATTERN = '/components/**/*.xml';

module.exports = async function importDependencies(dir) {
  const modules = buildModules();
  const dependenciesImporter = await createDependenciesImporter(dir, modules);

  return updateXmlFiles(dir, dependenciesImporter);
}

async function updateXmlFiles(dir, dependenciesImporter) {
  const xmlFilePaths = await glob(path.join(dir, XML_FILE_PATH_PATTERN));

  return Promise.all(
    xmlFilePaths.map(filePath => updateXmlFile(filePath, dir, dependenciesImporter))
  );
}

async function updateXmlFile(filePath, dir, dependenciesImporter) {
  const fileLines = await FileHandler.readLines(filePath);

  const xmlDependencies = new XmlDependencies(fileLines, filePath, dir);
  const dependencyPaths = xmlDependencies.getPaths();
  const dependencyPathsToAdd = dependenciesImporter.import(dependencyPaths);

  const updater = new XmlScriptsUpdater(fileLines, filePath, xmlDependencies);
  await updater.update(dependencyPathsToAdd);
}

async function createDependenciesImporter(dir, modules) {
  const mapping = await new DependenciesMappingGenerator(modules).generate(dir);
  const finder = new DependenciesFinder(mapping);

  return new DependenciesImporter(finder, mapping);
}
