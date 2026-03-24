const fs = require('fs-extra');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const { postFormWithDigestAuth, fetchWithDigestAuth } = require('./digest-auth');

const KopytkoError = require('../errors/kopytko-error');

module.exports = class ScreenshotTaker {
  _SCREENSHOT_URI_PATH = /"(pkgs\/dev\.jpg\?time=\d+)">/;

  _config = {};

  /**
   * @param  {Object} config
   * @param  {String} config.rokuIP
   * @param  {String} config.rokuDevPassword
   * @param  {String} config.rokuDevUser
   * @param  {String} config.screenshotDir
   */
  constructor(config) {
    this._config = config;
  }

  async takeScreenshot() {
    try {
      const response = await this._sendRequest({
        action: 'Screenshot',
        ...this._config,
      });

      const [, screenshotUriPath] = response.body.match(this._SCREENSHOT_URI_PATH) || [];

      if (screenshotUriPath) {
        await fs.ensureDir(this._config.screenshotDir);

        const screenshotFilePath = path.join(this._config.screenshotDir, `Screenshot_${new Date().toISOString()}.jpg`);
        const downloadResponse = await this._downloadScreenshot({
          screenshotUri: `http://${this._config.rokuIP}/${screenshotUriPath}`,
          ...this._config,
        });

        const nodeStream = Readable.fromWeb(downloadResponse.body);
        const file = fs.createWriteStream(screenshotFilePath);
        await pipeline(nodeStream, file);

        return;
      }

      throw new KopytkoError('Something went wrong. Check if Roku does not have a screen saver on.');
    } catch (error) {
      throw new KopytkoError(`Unknown error. HTTP status code: ${error.statusCode}`, error);
    }
  }

  _sendRequest({ action, rokuIP, rokuDevPassword, rokuDevUser }) {
    const fields = [
      { name: 'mysubmit', value: action },
    ];

    return postFormWithDigestAuth(
      `http://${rokuIP}/plugin_inspect`,
      fields,
      { user: rokuDevUser, pass: rokuDevPassword },
      { resolveWithFullResponse: true },
    );
  }

  _downloadScreenshot({ rokuDevUser, rokuDevPassword, screenshotUri }) {
    return fetchWithDigestAuth(
      screenshotUri,
      { method: 'GET' },
      { user: rokuDevUser, pass: rokuDevPassword },
      { stream: true },
    );
  }
}
