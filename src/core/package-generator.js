const fs = require('fs-extra');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const { postFormWithDigestAuth, fetchWithDigestAuth } = require('./digest-auth');

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
    await fs.ensureDir(path.dirname(downloadedPackagePath));

    const response = await this._downloadSignedPackageRequest({ generatedPackagePath, ...this._config });
    const nodeStream = Readable.fromWeb(response.body);
    const file = fs.createWriteStream(downloadedPackagePath);
    await pipeline(nodeStream, file);
  }

  async _sendSignPackageRequest({ appName, rokuDevSigningPassword, rokuDevPassword, rokuDevUser, rokuIP }) {
    const fields = [
      { name: 'mysubmit', value: 'Package' },
      { name: 'pkg_time', value: (new Date()).getTime().toString() },
      { name: 'passwd', value: rokuDevSigningPassword },
      { name: 'app_name', value: appName },
    ];

    return postFormWithDigestAuth(
      `http://${rokuIP}/plugin_package`,
      fields,
      { user: rokuDevUser, pass: rokuDevPassword },
    );
  }

  _downloadSignedPackageRequest({ generatedPackagePath, rokuDevPassword, rokuDevUser, rokuIP }) {
    return fetchWithDigestAuth(
      `http://${rokuIP}/${generatedPackagePath}`,
      { method: 'GET' },
      { user: rokuDevUser, pass: rokuDevPassword },
      { stream: true },
    );
  }
}
