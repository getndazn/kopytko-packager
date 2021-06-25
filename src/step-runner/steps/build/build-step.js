const PackageBuilder = require('../../../core/package-builder');
const Plugins = require('../../../core/plugins');
const Step = require('../step');

module.exports = class BuildStep extends Step {
  static TITLE = 'Building package';

  /**
   * Builds the ZIP package. Uses core and configurable plugins to modify files on the fly.
   *
   * @param {Object} config
   * @param {String} config.archivePath
   * @param {String} config.env
   * @param {String} config.rootDir
   * @param {String} config.sourceDir
   * @param {String} config.tempDir
   */
  async run({ archivePath, env, rootDir, sourceDir, tempDir }) {
    const builder = new PackageBuilder({ env, sourceDir, tempDir });
    const plugins = new Plugins({ rootDir });

    try {
      this.logger.subStep('Creating temporary files');
      await builder.createTemporaryFiles();

      this.logger.subStep('Applying plugins');
      await builder.applyPlugins(plugins, pluginName => this.logger.comment(pluginName));

      this.logger.subStep('Creating archive');
      await builder.archive(archivePath);
    } finally {
      this.logger.subStep('Removing temporary files');
      await builder.removeTemporaryFiles();
    }

    return 'Package built successfully';
  }
}
