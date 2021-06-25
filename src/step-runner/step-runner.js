const KopytkoError = require('../errors/kopytko-error');
const RokuError = require('../errors/roku-error');
const StepLogger = require('./step-logger');

module.exports = class StepRunner {
  _preventExiting = false
  _steps = [];

  constructor(steps, preventExiting = false) {
    this._preventExiting = preventExiting;
    this._steps = steps;
  }

  async run() {
    try {
      for (const { step, config } of this._steps) {
        await this._runStep(step, config);
      }

      if (!this._preventExiting) {
        this._exitWithSuccess()
      }
    } catch (error) {
      if (!(error instanceof KopytkoError || error instanceof RokuError)) {
        throw error;
      }

      this._exitWithError();
    }
  }

  async _runStep(step, config) {
    const logger = new StepLogger(step.TITLE);

    try {
      const stepInstance = new step(logger);
      const result = await stepInstance.run(config || {});
      logger.succeed(result);
    } catch (error) {
      if (error instanceof KopytkoError || error instanceof RokuError) {
        logger.fail(error);
      }

      throw error;
    }
  }

  _exitWithSuccess() {
    process.exit();
  }

  _exitWithError() {
    process.exit(1);
  }
}
