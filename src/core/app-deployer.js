const fs = require('fs');
const { postFormWithDigestAuth } = require('./digest-auth');

const KopytkoError = require('../errors/kopytko-error');

module.exports = class AppDeployer {
  _MESSAGE_COMPILATION_FAILED = 'Install Failure: Compilation Failed.';
  _MESSAGE_INSTALL_SUCCESS = 'Install Success.';
  _MESSAGE_REGEX = /'Set message content', '([^']+)'/g;

  _config = {};

  /**
   * @param  {Object} config
   * @param  {String} config.rokuIP
   * @param  {String} config.rokuDevPassword
   * @param  {String} config.rokuDevUser
   */
  constructor(config) {
    this._config = config;
  }

  async uninstallCurrentApp() {
    try {
      await this._sendRequest({ archivePath: '', action: 'Delete', ...this._config });
    } catch {
      return; // don't process response and fail silently (fails if there is no app installed)
    }
  }

  async installApp(archivePath) {
    try {
      const response = await this._sendRequest({
        archivePath,
        action: 'Replace',
        ...this._config,
      });
      const messages = Array.from(response.body.matchAll(this._MESSAGE_REGEX), match => match[1]);
      if (!response.body.includes(this._MESSAGE_INSTALL_SUCCESS) && !messages.includes(this._MESSAGE_INSTALL_SUCCESS)) {
        throw new KopytkoError(`Unknown error: ${messages.join(' ')}`);
      }

      return messages.join(' ');
    } catch (error) {
      if (error.statusCode === 401) {
        throw new KopytkoError('Bad Roku Developer credentials. Check ROKU_DEV_PASSWORD and ROKU_DEV_USER in .env file');
      }

      if (error.statusCode === 577) {
        throw new KopytkoError('Update Roku OS');
      }

      if (error.message.includes(this._MESSAGE_COMPILATION_FAILED)) {
        throw new KopytkoError('Compilation Failed');
      }

      throw new KopytkoError(`Unknown error. HTTP status code: ${error.statusCode}`, error);
    }
  }

  _sendRequest({ rokuIP, rokuDevPassword, rokuDevUser, archivePath, action }) {
    const fields = [
      { name: 'mysubmit', value: action },
    ];

    if (archivePath) {
      fields.push({
        name: 'archive',
        value: fs.readFileSync(archivePath),
        filename: 'archive.zip',
        contentType: 'application/octet-stream',
      });
    } else {
      fields.push({ name: 'archive', value: '' });
    }

    return postFormWithDigestAuth(
      `http://${rokuIP}/plugin_install`,
      fields,
      { user: rokuDevUser, pass: rokuDevPassword },
      { resolveWithFullResponse: true },
    );
  }
}
