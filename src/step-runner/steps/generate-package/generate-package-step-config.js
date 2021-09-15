const path = require('path');

const args = require('../../../env/args');
const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  generatedPackagePath: path.join(process.env.PWD, kopytkoConfig.generatedPackagePath),
  rokuIP: args.rokuIP,
  rokuDevPassword: args.rokuDevPassword,
  rokuDevUser: args.rokuDevUser,
  rokuDevSigningPassword: args.rokuDevSigningPassword,
}
