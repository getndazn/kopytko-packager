const args = require('../../env/args');
const fs = require('fs').promises;
const path = require('path');
const kopytkoConfig = require('../../env/kopytko-config');
const utils = require('../../utils');

module.exports = function generateManifest(rootDir) {
  const targetPath = path.join(rootDir, 'manifest');
  let content = formatToStringArray(kopytkoConfig.manifest).join('\n');

  if (args.forceHttp) {
    content = content.replace(/https:\/\//ig, 'http://');
  }

  return fs.writeFile(targetPath, content, 'utf8');
}

function formatToStringArray(settings) {
  return Object.entries(settings).map(([key, value]) => {
    // overwrites config with the command line arguments
    if (args[key] !== undefined) {
      value = args[key];
    }

    if (value === undefined || value === null) return '';

    const parsedValue = utils.isObject(value) ? formatToStringArray(value).join(';') : value.toString();

    return `${key}=${parsedValue}`;
  }).filter(entry => entry);
}
