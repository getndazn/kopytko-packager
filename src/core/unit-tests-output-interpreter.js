const RokuError = require('../errors/roku-error');

module.exports = class UnitTestsOutputInterpreter {
  _accumulatedData = [];
  _isWaitingForRuntimeErrorDetails = false;
  _failedTestsLines = [];
  _wasInitialTelnetDataIgnored = false;

  _resultReject; /** @type {function} */
  _resultResolve; /** @type {function} */

  waitForResults() {
    return new Promise((resolve, reject) => {
      this._resultResolve = resolve;
      this._resultReject = reject;
    });
  }

  process(data) {
    if (!this._wasInitialTelnetDataIgnored) {
      this._wasInitialTelnetDataIgnored = true; // Ignoring existing telnet data

      return;
    }

    const dataString = data.toString();
    const dataLines = dataString.split(/\r?\n/);
    dataLines.pop(); // the last line is always an additional empty line
    this._accumulatedData.push(...dataLines);

    const runtimeErrorLineIndex = dataLines.findIndex(line => line.includes('runtime error'));
    if (runtimeErrorLineIndex > -1) {
      this._isWaitingForRuntimeErrorDetails = true;

      return;
    }

    if (this._isWaitingForRuntimeErrorDetails) {
      const selectedThreadMarkLineIndex = dataLines.findIndex(line => line.includes('*selected'));
      if (selectedThreadMarkLineIndex > -1) {
        const errorDetailsStartLineIndex = this._accumulatedData.findIndex(line => line.includes('Thread selected:'));

        return this._resultReject(new RokuError('Runtime error', this._accumulatedData.slice(errorDetailsStartLineIndex)));
      }
    }

    // "dash" checks have to be exactly like this to avoid printing "------ Compiling dev '<<app name>>' ------"
    const failedTestsLines = dataLines.filter(line => line.includes('---  ') || line.includes('---------') && !line.includes('[beacon.'));
    const resultLines = dataLines.filter(line => line.includes('Total') && line.includes('Passed'));

    this._failedTestsLines.push(...failedTestsLines);

    if (resultLines[0]) {
      const results = this._getTestsResults(resultLines[0]);

      this._resultResolve({ results, failedTestsLines: this._failedTestsLines });
    }
  }

  _getTestsResults(summaryString) {
    return {
      total: this._getTestsResultsProperty(summaryString, 'Total'),
      passed: this._getTestsResultsProperty(summaryString, 'Passed'),
      failed: this._getTestsResultsProperty(summaryString, 'Failed'),
    };
  }

  _getTestsResultsProperty(summaryString, property) {
    return parseInt(
      this._getPropertyRegex(property).exec(summaryString)[1], 10
    );
  }

  // The current results line in telnet looks like:
  // ***   Total  = 145 ; Passed  =  139 ; Failed   =  6 ; Skipped   =  0 ; Crashes  =  0 Time spent:  1165ms
  _getPropertyRegex(property) {
    return new RegExp(`${property}\\s*=\\s*(\\d+)`, 'g');
  }
}
