const Archiver = require('../../../core/archiver');
const Step = require('../step');

module.exports = class ExtractArchiveStep extends Step {
  static TITLE = 'Extracting archive';

  /**
   * Extracts a ZIP package
   *
   * @param {Object} config
   * @param {String} config.archivePath
   * @param {String} config.outputDir
   */
  async run({ archivePath, outputDir }) {
    return new Archiver().extract(archivePath, outputDir);
  }
}
