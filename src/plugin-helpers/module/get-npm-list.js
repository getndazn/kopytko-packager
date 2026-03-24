const childProcess = require('child_process');

const cache = new Map();

module.exports = function getNpmList({
  cwd = process.cwd(),
  depth = null,
  prodOnly = true,
} = {}) {
  const cacheKey = `${cwd}|${depth}|${prodOnly}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const prodFlag = prodOnly ? '--omit=dev' : '';
  const depthArg = `--depth=${depth || 'Infinity'}`;

  let npmListJson;
  try {
    npmListJson = childProcess.execSync(`npm ls ${prodFlag} ${depthArg} --json`, { cwd, stdio: ['pipe', 'pipe', 'pipe'] })
      .toString();
  } catch (error) {
    // npm ls exits with non-zero when there are extraneous/invalid packages,
    // but still outputs valid JSON to stdout. Use the stdout output.
    if (error.stdout && error.stdout.length > 0) {
      npmListJson = error.stdout.toString();
    } else {
      throw error;
    }
  }

  const result = JSON.parse(npmListJson);
  cache.set(cacheKey, result);

  return result;
}
