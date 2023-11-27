const path = require('path');

const args = require('../../../env/args');
const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  rokuIP: args.rokuIP,
  rokuDevPassword: args.rokuDevPassword,
  screenshotDir: path.join(process.cwd(), kopytkoConfig.screenshotDir),
}
