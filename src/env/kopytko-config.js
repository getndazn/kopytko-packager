const utils = require('../utils');
const args = require('./args');
const KopytkorcReader = require('./kopytkorc-reader');

const kopytkorc = new KopytkorcReader();

function getManifestConfig() {
  const { baseConfig, envManifestConfig, localManifestOverride } = kopytkorc.getManifestConfig(args.env);

  return utils.mergeDeep({}, baseConfig, envManifestConfig, localManifestOverride);
}

function getPluginNames() {
  const envPlugins = kopytkorc.getEnvConfig(args.env).plugins || [];
  const globalPlugins = kopytkorc.getGlobalPlugins();
  const sortedPlugins = sortPlugins(envPlugins, globalPlugins);

  return sortedPlugins.map(({ name }) => name);
}

function sortPlugins(envPlugins, globalPlugins) {
  const preEnvPlugins = globalPlugins.filter(({ preEnvironmentPlugin }) => preEnvironmentPlugin);
  const preGlobalPlugins = envPlugins.filter(({ postGlobalPlugin }) => !postGlobalPlugin);
  const postEnvPlugins = globalPlugins.filter(({ preEnvironmentPlugin }) => !preEnvironmentPlugin);
  const postGlobalPlugins = envPlugins.filter(({ postGlobalPlugin }) => postGlobalPlugin);

  return [
    ...preEnvPlugins, // global plugins with preEnvironmentPlugin: true
    ...preGlobalPlugins, // env plugins
    ...postEnvPlugins, // global plugins
    ...postGlobalPlugins, // env plugins with postGlobalPlugin: true
  ];
}

module.exports = {
  archivePath: kopytkorc.getArchivePath(args.env),
  ignoredFiles: [], // Empty array for now. Eventually to add later.
  manifest: getManifestConfig(),
  pluginDefinitions: kopytkorc.getPluginDefinitions(),
  pluginNames: getPluginNames(),
  sourceDir: kopytkorc.getSourceDir(args.env),
  tempDir: kopytkorc.getTempDir(args.env),
};
