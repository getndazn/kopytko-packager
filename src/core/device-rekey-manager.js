const fs = require('fs');
const { postFormWithDigestAuth } = require('./digest-auth');
const xml2js = require('xml2js');

const KopytkoError = require('../errors/kopytko-error');

module.exports = class DeviceRekeyManager {
  _MESSAGE_REKEY_SUCCESS = 'Success.';
  _MESSAGE_REGEX = /<font color="red">([^<]+)<\/font>/;

  _config = {};

  /**
   * @param  {Object} config
   * @param  {String} config.rokuIP
   * @param  {String} config.rokuDevPassword
   * @param  {String} config.rokuDevUser
   * @param  {String} config.rokuDevSigningPassword
   * @param  {String} config.rokuDevId
   */
  constructor(config) {
    this._config = config;
  }

  async checkKey() {
    let devId = await this._getDevId();

    return (devId === this._config.rokuDevId);
  }

  async rekey(rekeySignedArchivePath) {
    if (!rekeySignedArchivePath) {
      throw new KopytkoError('Missing signedPackagePath');
    }

    if (!this._config.rokuDevSigningPassword) {
      throw new KopytkoError('Missing rokuDevSigningPassword');
    }

    const response = await this._sendRekeyRequest({
      archivePath: rekeySignedArchivePath,
      ...this._config,
    });

    let resultTextSearch = this._MESSAGE_REGEX.exec(response.body);

    if (!resultTextSearch) {
      throw new KopytkoError('Unknown Rekey Failure');
    }

    if (resultTextSearch[1] !== this._MESSAGE_REKEY_SUCCESS) {
      throw new KopytkoError(`Rekey Failure: ${resultTextSearch[1]}`);
    }

    if (this._config.rokuDevId) {
      const isDevIdCorrect = await this.checkKey();

      if (!isDevIdCorrect) {
        throw new KopytkoError(`Rekey was successful but Dev app ID is not equal ${this._config.rokuDevId}`);
      }
    }
  }

  async _getDevId() {
    const deviceInfo = await this._sendDeviceInfoRequest({ ...this._config });

    return deviceInfo['keyed-developer-id'];
  }

  async _sendRekeyRequest({ archivePath, rokuDevPassword, rokuDevSigningPassword, rokuDevUser, rokuIP }) {
    const fields = [
      { name: 'mysubmit', value: 'Rekey' },
      { name: 'passwd', value: rokuDevSigningPassword },
      {
        name: 'archive',
        value: fs.readFileSync(archivePath),
        filename: 'archive.pkg',
        contentType: 'application/octet-stream',
      },
    ];

    try {
      return await postFormWithDigestAuth(
        `http://${rokuIP}/plugin_inspect`,
        fields,
        { user: rokuDevUser, pass: rokuDevPassword },
        { resolveWithFullResponse: true },
      );
    } catch (error) {
      if (error.statusCode === 401) {
        throw new KopytkoError('Bad Roku Developer credentials.');
      }

      throw new KopytkoError(`Unknown error. HTTP status code: ${error.statusCode}`, error);
    }
  }

  async _sendDeviceInfoRequest({ rokuIP }) {
    try {
      const response = await fetch(`http://${rokuIP}:8060/query/device-info`);
      const responseText = await response.text();
      const jsResponse = await xml2js.parseStringPromise(responseText, {
        explicitArray: false,
      });

      return jsResponse['device-info'];
    } catch (error) {
      throw new KopytkoError(`Unknown error. HTTP status code: ${error.statusCode}`, error);
    }
  }
}
