const AppDeployer = require('../../../core/app-deployer');
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
   * @param  {String} config.rokuDevUser
   * @return {String} Message in case of successful upload
   */
  async run({ archivePath, rokuIP, rokuDevUser, rokuDevPassword }) {
    const deployer = new AppDeployer({ rokuIP, rokuDevUser, rokuDevPassword });

    this.logger.subStep('Uninstalling existing app');
    await deployer.uninstallCurrentApp();

    this.logger.subStep('Uploading and installing app');

    return deployer.installApp(archivePath);
  }
}
