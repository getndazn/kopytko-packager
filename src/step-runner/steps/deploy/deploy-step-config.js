const path = require('path');

const args = require('../../../env/args');
const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  archivePath: path.join(process.env.PWD, kopytkoConfig.archivePath),
  rokuIP: args.rokuIP,
  rokuDevPassword: args.rokuDevPassword,
  rokuDevUser: args.rokuDevUser,
}
