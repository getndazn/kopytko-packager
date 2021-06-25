const { CopyCommand } = require('ropm/dist/commands/CopyCommand');

const { tempDir } = require('../../env/kopytko-config');

module.exports = function copyDependencies() {
  return new CopyCommand({ rootDir: tempDir }).run();
}
