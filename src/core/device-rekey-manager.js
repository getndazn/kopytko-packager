const fs = require('fs');
const request = require('request-promise');
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
      archive: fs.createReadStream(rekeySignedArchivePath),
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

  _sendRekeyRequest({ archive, rokuDevPassword, rokuDevSigningPassword, rokuDevUser, rokuIP }) {
    return request({
      method: 'POST',
      uri: `http://${rokuIP}/plugin_inspect`,
      formData: {
        mysubmit: 'Rekey',
        passwd: rokuDevSigningPassword,
        archive,
      },
      auth: {
        user: rokuDevUser,
        pass: rokuDevPassword,
        sendImmediately: false,
      },
      resolveWithFullResponse: true,
    }).catch(error => {
      if (error.statusCode === 401) {
        throw new KopytkoError('Bad Roku Developer credentials.');
      }

      throw new KopytkoError(`Unknown error. HTTP status code: ${error.statusCode}`, error);
    });
  }

  _sendDeviceInfoRequest({ rokuIP }) {
    return request({
      method: 'GET',
      uri: `http://${rokuIP}:8060/query/device-info`,
    }).then(async response => {
      const jsResponse = await xml2js.parseStringPromise(response, {
        explicitArray: false
      });

      return jsResponse['device-info'];
    }).catch(error => {
      throw new KopytkoError(`Unknown error. HTTP status code: ${error.statusCode}`, error);
    });
  }
}
