const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');

module.exports = class Archiver {
  async archive(archivePath, sourceDir) {
    const archiveDir = path.dirname(archivePath);
    await fs.ensureDir(archiveDir);

    const zip = new AdmZip(null, {});
    zip.addLocalFolder(sourceDir);

    return zip.writeZipPromise(archivePath, {});
  }

  async extract(archivePath, outputDir) {
    await fs.rm(outputDir, { recursive: true, force: true });

    return new AdmZip(archivePath).extractAllTo(outputDir, true);
  }
}
