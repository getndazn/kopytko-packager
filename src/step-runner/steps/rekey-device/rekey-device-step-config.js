const path = require('path');

const args = require('../../../env/args');

module.exports = {
  signedPackagePath: path.join(process.cwd(), args.signedPackagePath),
  rokuIP: args.rokuIP,
  rokuDevPassword: args.rokuDevPassword,
  rokuDevId: args.rokuDevId,
  rokuDevSigningPassword: args.rokuDevSigningPassword,
}
