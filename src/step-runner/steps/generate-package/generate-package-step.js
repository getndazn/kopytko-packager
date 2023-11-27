const path = require('path');
const { generatePackage } = require('roku-dev');

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
   * @param  {String} config.rokuIP
   */
  async run({ generatedPackagePath, rokuDevPassword, rokuDevSigningPassword, rokuIP }) {
    await generatePackage({
      appName: path.parse(generatedPackagePath).name,
      rokuDevPassword,
      rokuDevSigningPassword,
      rokuIP,
      signedPackageFilePath: generatedPackagePath,
    });
  }
}
