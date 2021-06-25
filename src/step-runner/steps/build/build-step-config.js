const path = require('path');

const args = require('../../../env/args');
const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  archivePath: path.join(process.env.PWD, kopytkoConfig.archivePath),
  env: args.env,
  rootDir: process.env.PWD,
  sourceDir: path.join(process.env.PWD, kopytkoConfig.sourceDir),
  tempDir: path.join(process.env.PWD, kopytkoConfig.tempDir),
}
