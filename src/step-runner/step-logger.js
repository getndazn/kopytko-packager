const ora = require('ora');
const term = require('terminal-kit').terminal;

const COMMENT_PREFIX = '    \u{2022} '; // dot sign
const SUB_STEP_PREFIX = '  \u{21B3} '; // enter-ish arrow

module.exports = class StepLogger {
  _spinner = null;
  _text = '';

  constructor(stepName) {
    this._text = stepName;
    this._spinner = ora(this._text).start();
  }

  succeed(result) {
    this._spinner.succeed();
    if (result) {
      term.green('  %s\n', result);
    }
  }

  fail(error) {
    this._spinner.fail();
    term.red('  %s\n', error.message);

    if (error.telnetOutput) {
      term.red('  Details from terminal:\n\n');
      term(error.telnetOutput.join('\n'));
    }

    term('\n\n');
  }

  subStep(name) {
    this._text += `\n${SUB_STEP_PREFIX}${name}`
    this._spinner.text = this._text;
  }

  comment(comment) {
    this._text += `\n${COMMENT_PREFIX}${comment}`;
    this._spinner.text = this._text;
  }
}
