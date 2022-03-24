const path = require('path');

const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  archivePath: path.join(process.cwd(), kopytkoConfig.archivePath),
  outputDir: path.join(process.cwd(), '/out/debug/'),
}
