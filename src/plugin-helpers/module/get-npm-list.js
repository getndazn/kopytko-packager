const childProcess = require('child_process');

module.exports = function getNpmList({
  cwd = process.cwd(),
  depth = null,
  prodOnly = true,
} = {}) {
  const prodFlag = prodOnly ? '--prod' : '';
  const depthArg = `--depth=${depth || 'Infinity'}`;
  const npmListJson = childProcess.execSync(`npm ls ${prodFlag} ${depthArg} --json`, { cwd })
    .toString();

  return JSON.parse(npmListJson);
}
