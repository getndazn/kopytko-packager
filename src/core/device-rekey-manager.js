const { deviceInfo, rekeyDevice } = require('roku-dev');

const KopytkoError = require('../errors/kopytko-error');

module.exports = class DeviceRekeyManager {
  _config = {};

  /**
   * @param  {Object} config
   * @param  {String} config.rokuIP
   * @param  {String} config.rokuDevPassword
   * @param  {String} config.rokuDevSigningPassword
   * @param  {String} config.rokuDevId
   */
  constructor(config) {
    this._config = config;
  }

  async checkKey() {
    const devId = await this._getDevId();

    return (devId === this._config.rokuDevId);
  }

  async rekey(rekeySignedArchivePath) {
    if (!rekeySignedArchivePath) {
      throw new KopytkoError('Missing signedPackagePath');
    }

    if (!this._config.rokuDevSigningPassword) {
      throw new KopytkoError('Missing rokuDevSigningPassword');
    }

    await rekeyDevice({
      rokuDevSigningPassword: this._config.rokuDevSigningPassword,
      rokuDevPassword: this._config.rokuDevPassword,
      rokuIP: this._config.rokuIP,
      signedPackagePath: rekeySignedArchivePath,
    });

    if (this._config.rokuDevId) {
      const isDevIdCorrect = await this.checkKey();

      if (!isDevIdCorrect) {
        throw new KopytkoError(`Rekey was successful but Dev app ID is not equal ${this._config.rokuDevId}`);
      }
    }
  }

  async _getDevId() {
    const response = await deviceInfo({ rokuIP: this._config.rokuIP });

    return response['keyed-developer-id'];
  }
}
