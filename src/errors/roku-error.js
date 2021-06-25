module.exports = class RokuError extends Error {
  telnetOutput;

  constructor(message, telnetOutput = null) {
    super(message);

    this.telnetOutput = telnetOutput;
  }
}
