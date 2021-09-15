const fs = require('fs-extra');
const path = require('path');
const request = require('request-promise');

const KopytkoError = require('../errors/kopytko-error');

module.exports = class PackageGenerator {
  _MESSAGE_FAILURE_REGEX = /<font.*>Failed: (.*)/;
  _MESSAGE_SUCCESS_REGEX = /<a href="(pkgs\/[^.]+.pkg)">/;

  _config = {};

  /**
   * @param  {Object} config
   * @param  {String} config.rokuIP
   * @param  {String} config.rokuDevPassword
   * @param  {String} config.rokuDevUser
   * @param  {String} config.rokuDevSigningPassword
   */
  constructor(config) {
    this._config = config;
  }

  async sign(appName) {
    if (!this._config.rokuDevSigningPassword) {
      throw new KopytkoError('Missing rokuDevSigningPassword');
    }

    const response = await this._sendSignPackageRequest({ appName, ...this._config });
    const failureReasonMatches = this._MESSAGE_FAILURE_REGEX.exec(response);

    if (failureReasonMatches) {
      throw new KopytkoError(failureReasonMatches[1], response);
    }

    const pkgNameMatches = this._MESSAGE_SUCCESS_REGEX.exec(response);

    if (pkgNameMatches) {
      return pkgNameMatches[1];
    }

    throw new KopytkoError('Unknown error during signing the package', response);
  }

  async download(generatedPackagePath, downloadedPackagePath) {
    await fs.ensureDir(path.dirname(generatedPackagePath));

    return new Promise(resolve => {
      const file = fs.createWriteStream(downloadedPackagePath);

      file.on('finish', resolve);

      this._downloadSignedPackageRequest({ generatedPackagePath, ...this._config })
        .pipe(file);
    });
  }

  _sendSignPackageRequest({ appName, rokuDevSigningPassword, rokuDevPassword, rokuDevUser, rokuIP }) {
    return request({
      method: 'POST',
      uri: `http://${rokuIP}/plugin_package`,
      formData: {
        mysubmit: 'Package',
        pkg_time: (new Date()).getTime().toString(),
        passwd: rokuDevSigningPassword,
        app_name: appName,
      },
      auth: {
        user: rokuDevUser,
        pass: rokuDevPassword,
        sendImmediately: false,
      },
    });
  }

  _downloadSignedPackageRequest({ generatedPackagePath, rokuDevPassword, rokuDevUser, rokuIP }) {
    return request({
      method: 'GET',
      uri: `http://${rokuIP}/${generatedPackagePath}`,
      auth: {
        user: rokuDevUser,
        pass: rokuDevPassword,
        sendImmediately: false,
      },
    });
  }
}
