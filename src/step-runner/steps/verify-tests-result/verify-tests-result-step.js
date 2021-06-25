const TestResultsFetcher = require('../../../core/test-results-fetcher');
const AppDeployer = require('../../../core/app-deployer');
const Step = require('../step');

module.exports = class VerifyTestsResultStep extends Step {
  static TITLE = 'Running unit tests';

  /**
   * Fetches the output from telnet and parses it into results. Compatible with Roku Unit Test Framework.
   *
   * @param {Object} config
   * @param {String} config.rokuIP
   * @param {String} config.rokuDevUser
   * @param {String} config.rokuDevPassword
   */
  async run({ rokuIP, rokuDevUser, rokuDevPassword  }) {
    const resultsFetcher = new TestResultsFetcher(rokuIP);
    const result = await resultsFetcher.fetch();

    const deployer = new AppDeployer({ rokuIP, rokuDevUser, rokuDevPassword });
    await deployer.uninstallCurrentApp();

    return result;
  }
}
