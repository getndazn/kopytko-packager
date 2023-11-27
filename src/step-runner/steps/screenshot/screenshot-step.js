const path = require('path');
const { takeScreenshot } = require('roku-dev');
const Step = require('../step');

module.exports = class ScreenshotStep extends Step {
  static TITLE = 'Screenshot';

  /**
   * Takes a screenshot of current .
   *
   * @param {Object} config
   * @param {String} config.rokuIP
   * @param {String} config.rokuDevPassword
   * @param {String} config.screenshotDir
   */
  async run({ rokuIP, rokuDevPassword, screenshotDir }) {
    const screenshotFilePath = path.join(screenshotDir, `Screenshot_${new Date().toISOString()}.jpg`)

    return takeScreenshot({
      rokuDevPassword,
      rokuIP,
      screenshotFilePath,
    });
  }
}
