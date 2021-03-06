const path = require('path');

const args = require('../../../env/args');
const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  archivePath: path.join(process.cwd(), kopytkoConfig.archivePath),
  env: args.env,
  rootDir: process.cwd(),
  sourceDir: path.join(process.cwd(), kopytkoConfig.sourceDir),
  tempDir: kopytkoConfig.tempDir,
}
