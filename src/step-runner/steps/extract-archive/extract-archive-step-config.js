const path = require('path');

const kopytkoConfig = require('../../../env/kopytko-config');

module.exports = {
  archivePath: path.join(process.env.PWD, kopytkoConfig.archivePath),
  outputDir: path.join(process.env.PWD, '/out/debug/'),
}
