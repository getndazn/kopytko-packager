const term = require('terminal-kit').terminal;

const args = require('./args');

/**
 * @param {Object} [options={}]
 * @param {boolean} options.buildOnlyMode
 * @returns {Promise<Object>}
 */
module.exports = async function validateArgs(options = {}) {
  if (args.forceHttp) {
    term.red('DANGER!!!! You are going to use unsecured http protocol for every URL in the manifest.\nAre you sure you want to continue? (y/n)\n');
    const result = await term.yesOrNo({ yes: ['y'], no: ['n', 'ENTER', 'ESCAPE'] }).promise;

    if (!result) throw new Error('Not allowed forceHttp flag usage');

    term.grabInput(false);
  }

  if (!options.buildOnlyMode && !args.rokuIP) {
    throw new Error('Configure ROKU_IP in the .env file or pass as an environment variable!');
  }

  return args;
}
