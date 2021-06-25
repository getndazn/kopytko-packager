module.exports = class KopytkoError extends Error {
  constructor(message, error) {
    let errorMessage = message;

    if (error) {
      errorMessage += `\n\n${error.stack || ''}`;
    }

    super(errorMessage);

    this.name = "KopytkoError";
  }
}
