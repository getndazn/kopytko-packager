const { once } = require('events');
const Telnet = require('telnet-client');

const KopytkoError = require('../errors/kopytko-error');
const RokuError = require('../errors/roku-error');
const UnitTestsOutputInterpreter = require('./unit-tests-output-interpreter');

module.exports = class TestResultsFetcher {
  _CONNECTION_ERROR_MESSAGES = {
    close: 'Couldn\'t connect via telnet! Check the connection or if telnet is already in use.',
    timeout: 'Telnet connection timeout',
  }
  _CONNECTION_PORT = 8085;
  _CONNECTION_TIMEOUT = 20000;

  _connection = null;
  _outputInterpreter;
  _rokuIP;

  constructor(rokuIP) {
    this._outputInterpreter = new UnitTestsOutputInterpreter();
    this._rokuIP = rokuIP;
  }

  async fetch() {
    this._connection = new Telnet();

    try {
      await this._connection.connect({
        host: this._rokuIP,
        port: this._CONNECTION_PORT,
        shellPrompt: '',
        timeout: this._CONNECTION_TIMEOUT,
      });
    } catch (error) {
      throw new KopytkoError(`Telnet connection error: ${error.message}`);
    }

    return Promise.race([
      this._handleConnectionError('close'),
      this._handleConnectionError('timeout'),
      this._processResults(),
    ]);
  }

  async _handleConnectionError(event) {
    await once(this._connection, event);

    throw new KopytkoError(this._CONNECTION_ERROR_MESSAGES[event]);
  }

  async _processResults() {
    this._connection.shell((_, stream) => {
      stream.on('data', data => this._outputInterpreter.process(data));
    });

    const { results, failedTestsLines } = await this._outputInterpreter.waitForResults();
    const { total, passed, failed } = results;

    const result = `Total: ${total} | Passed: ${passed} | Failed: ${failed}`;

    if (total !== passed) { // not comparing failed tests because of possibility of crashed tests
      throw new RokuError(result, failedTestsLines);
    }

    return result;
  }
}
