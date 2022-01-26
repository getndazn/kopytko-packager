const path = require('path');

const args = require('../../../env/args');
const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  rokuIP: args.rokuIP,
  rokuDevPassword: args.rokuDevPassword,
  rokuDevUser: args.rokuDevUser,
  screenshotDir: path.join(process.env.PWD, kopytkoConfig.screenshotDir),
}
