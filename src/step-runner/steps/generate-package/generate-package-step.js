const path = require('path');

const PackageGenerator = require('../../../core/package-generator');
const Step = require('../step');

module.exports = class GeneratePackageStep extends Step {
  static TITLE = 'Generate package';

  /**
   * Generate signed package
   *
   * @param  {Object} config
   * @param  {String} config.generatedPackagePath
   * @param  {String} config.rokuDevPassword
   * @param  {String} config.rokuDevSigningPassword
   * @param  {String} config.rokuDevUser
   * @param  {String} config.rokuIP
   */
  async run({ generatedPackagePath, rokuDevPassword, rokuDevSigningPassword, rokuDevUser, rokuIP }) {
    const packageGenerator = new PackageGenerator({ rokuDevPassword, rokuDevSigningPassword, rokuDevUser, rokuIP });

    this.logger.subStep('Sign package');
    const appName = path.parse(generatedPackagePath).name;
    const generatedPackageName = await packageGenerator.sign(appName);

    this.logger.subStep('Download package');
    await packageGenerator.download(generatedPackageName, generatedPackagePath);
  }
}
