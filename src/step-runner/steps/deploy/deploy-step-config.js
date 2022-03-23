const path = require('path');

const args = require('../../../env/args');
const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  archivePath: path.join(process.cwd(), kopytkoConfig.archivePath),
  rokuIP: args.rokuIP,
  rokuDevPassword: args.rokuDevPassword,
  rokuDevUser: args.rokuDevUser,
}
