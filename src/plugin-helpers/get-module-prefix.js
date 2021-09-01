const latinize = require('latinize');

/**
 * Returns BrightScript identifiers-friendly string based on module name
 * BrightScript identifiers rules: https://developer.roku.com/en-gb/docs/references/brightscript/language/expressions-variables-types.md
 * @example
 * // returns 'kopytko_exampleModule_v2'
 * getModulePrefix('@kopytko/example-module', 2);
 * @example
 * // returns '_1kopytko_'
 * getModulePrefix('1kopytko_!');
 * @param {String} moduleName
 * @param {Number} [majorVersion]
 * @returns {String}
 */
module.exports = function getModulePrefix(moduleName, majorVersion = null) {
  const safeModuleName = latinize(moduleName)
    .replace('/', '_')
    .replace(/[^a-zA-Z_0-9-]/g, '') // replace every invalid character except dash
    .replace(/-[a-z]/g, matches => matches[1].toUpperCase()) // for better readability make every letter after dash character uppercase
    .replace('-', '')
    .replace(/^([0-9])/, (_, match) => `_${match}`) // add underscore prefix if remaining name starts with a number

  if (!majorVersion) {
    return safeModuleName;
  }

  return safeModuleName.concat(`_v${majorVersion}`);
}
