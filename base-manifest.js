const path = require('path')
const packageJson = require(path.join(process.cwd(), 'package.json'));
const versionParts = packageJson.version.split('.');

module.exports = {
    /**
   * @type {string} Name of the channel.
   */
  title: '',

  /**
   * @type {object<[key: string]: boolean>} Environment settings.
   */
  bs_const: {},

  /**
   * @type {number} Major portion of the channel version.
   */
  major_version: parseInt(versionParts[0], 10),

  /**
   * @type {number} Minor portion of the channel version.
   */
  minor_version: parseInt(versionParts[1], 10),

  /**
   * @type {number} Build number.
   */
  build_version: parseInt(versionParts[2], 10),

  /**
   * @type {string} Local URI for the HD channel icon.
   */
  mm_icon_focus_hd: '',

  /**
   * @type {string} Local URI for the SD channel icon.
   */
  mm_icon_focus_sd: '',

  /**
   * @type {string} Local URI for the HD splash screen displayed when the channel is launched.
   */
  splash_screen_hd: '',

  /**
   * @type {string} Local URI for the SD splash screen displayed when the channel is launched.
   */
  splash_screen_sd: '',
}
