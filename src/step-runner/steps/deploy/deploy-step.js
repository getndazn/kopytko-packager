const { uploadApp } = require('roku-dev');
const Step = require('../step');

module.exports = class DeployStep extends Step {
  static TITLE = 'Deploying package';

  /**
   * Sends the archive into Roku device
   *
   * @param  {Object} config
   * @param  {String} config.archivePath
   * @param  {String} config.rokuIP
   * @param  {String} config.rokuDevPassword
   * @return {String} Message in case of successful upload
   */
  async run({ archivePath, rokuIP, rokuDevPassword }) {
    return uploadApp({
      appArchivePath: archivePath,
      rokuDevPassword,
      rokuIP,
    });
  }
}
