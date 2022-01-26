const path = require("path");
const os = require("os");

const kopytoTempDir = '.kopytko_packager_temp';
let tempDir;

try {
  tempDir = path.join(os.tmpdir(), kopytoTempDir);
} catch (_) {
  tempDir = kopytoTempDir;
}

module.exports = {
  archivePath: '/dist/kopytko_archive.zip',
  generatedPackagePath: '/dist/kopytko_package.pkg',
  externalModulesDirName: 'kopytko_modules',
  kopytkorcFilename: '.kopytkorc',
  screenshotDir: '/dist',
  sourceDir: '/app',
  tempDir,
};
