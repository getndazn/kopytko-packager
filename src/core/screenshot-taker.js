const fs = require('fs-extra');
const path = require('path');
const request = require('request-promise');

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

        return new Promise(resolve => {
          const screenshotFilePath = path.join(this._config.screenshotDir, `Screenshot_${new Date().toISOString()}.jpg`)
          const file = fs.createWriteStream(screenshotFilePath);

          file.on('finish', resolve);

          this._downloadScreenshot({
            screenshotUri: `http://${this._config.rokuIP}/${screenshotUriPath}`,
            ...this._config,
          })
            .pipe(file);
        });
      }

      throw new KopytkoError('Something went wrong. Check if Roku does not have a screen saver on.');
    } catch (error) {
      throw new KopytkoError(`Unknown error. HTTP status code: ${error.statusCode}`, error);
    }
  }

  _sendRequest({ action, rokuIP, rokuDevPassword, rokuDevUser }) {
    return request({
      method: 'POST',
      uri: `http://${rokuIP}/plugin_inspect`,
      formData: {
        mysubmit: action,
      },
      auth: {
        user: rokuDevUser,
        pass: rokuDevPassword,
        sendImmediately: false,
      },
      resolveWithFullResponse: true,
    });
  }

  _downloadScreenshot({ rokuDevUser, rokuDevPassword, screenshotUri }) {
    return request({
      method: 'GET',
      uri: screenshotUri,
      auth: {
        user: rokuDevUser,
        pass: rokuDevPassword,
        sendImmediately: false,
      },
    });
  }
}
