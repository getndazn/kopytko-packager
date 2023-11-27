const DeviceRekeyManager = require('../../../core/device-rekey-manager');
const Step = require('../step');

module.exports = class RekeyDeviceStep extends Step {
  static TITLE = 'Rekey device';

  /**
   * Re-key Roku device with previously signed package
   *
   * @param  {Object} config
   * @param  {String} config.rokuDevId
   * @param  {String} config.rokuDevPassword
   * @param  {String} config.rokuDevSigningPassword
   * @param  {String} config.rokuIP
   * @param  {String} config.signedPackagePath
   */
  async run({ signedPackagePath, rokuIP, rokuDevPassword, rokuDevId, rokuDevSigningPassword }) {
    const deviceRekeyManager = new DeviceRekeyManager({
      rokuDevId,
      rokuDevPassword,
      rokuDevSigningPassword,
      rokuIP,
    });

    this.logger.subStep('Check dev id');
    const isDevAppIdCorrect = await deviceRekeyManager.checkKey();

    if (!isDevAppIdCorrect) {
      this.logger.comment('Dev id is incorrect');
      this.logger.subStep('Re-keying device');
      await deviceRekeyManager.rekey(signedPackagePath);
    } else {
      this.logger.comment('Dev id is correct');
    }
  }
}
