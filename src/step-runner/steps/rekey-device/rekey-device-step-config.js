const path = require('path');

const args = require('../../../env/args');
const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  signedPackagePath: path.join(process.env.PWD, kopytkoConfig.signedPackagePath),
  rokuIP: args.rokuIP,
  rokuDevPassword: args.rokuDevPassword,
  rokuDevUser: args.rokuDevUser,
  rokuDevId: args.rokuDevId,
  rokuDevSigningPassword: args.rokuDevSigningPassword,
}
