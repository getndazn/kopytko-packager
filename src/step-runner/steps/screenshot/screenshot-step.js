const ScreenshotTaker = require('../../../core/screenshot-taker');
const Step = require('../step');

module.exports = class ScreenshotStep extends Step {
  static TITLE = 'Screenshot';

  /**
   * Takes a screenshot of current .
   *
   * @param {Object} config
   * @param {String} config.rokuIP
   * @param {String} config.rokuDevUser
   * @param {String} config.rokuDevPassword
   * @param {String} config.screenshotDir
   */
  async run({ rokuIP, rokuDevUser, rokuDevPassword, screenshotDir }) {
    const screenshotTaker = new ScreenshotTaker({ rokuIP, rokuDevUser, rokuDevPassword, screenshotDir });

    this.logger.subStep('Taking a screenshot');

    return screenshotTaker.takeScreenshot();
  }
}
