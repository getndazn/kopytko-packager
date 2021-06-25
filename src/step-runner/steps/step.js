module.exports = class Step {
  static TITLE = '<Step title>';
  logger;

  constructor(logger) {
    this.logger = logger;
  }

  async run(config) {} // eslint-disable-line
}
