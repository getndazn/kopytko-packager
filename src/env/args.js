require('dotenv').config();
const minimist = require('minimist');

const firstArgument = process.argv[2] || '';
const anonymousArgument = !firstArgument.includes('--') ? firstArgument : '';
const env = process.env.ENV !== 'test' ? anonymousArgument : '';
const testFileName = process.env.ENV === 'test' ? anonymousArgument : '';

const args = minimist(process.argv.slice(2), {
  boolean: true,
  default: {
    /**
     * @type {string} Environment file name. Empty/non-existing value means default one.
     *
     *
     * ENV=production npm start
     * npm start -- --env=production
     */
    env: env || process.env.ENV || 'dev',

    /**
     * @type {string} Roku Developer password.
     *
     * ROKU_DEV_PASSWORD=pass
     *
     * ROKU_DEV_PASSWORD=pass npm start
     * npm start -- --rokuDevPassword=pass
     */
    rokuDevPassword: process.env.ROKU_DEV_PASSWORD || '',

    /**
     * @type {string} Roku Developer username.
     *
     * ROKU_DEV_USER=rokudev
     *
     * ROKU_DEV_USER=rokudev npm start
     * npm start -- --rokuDevUser=rokudev
     */
    rokuDevUser: process.env.ROKU_DEV_USER || 'rokudev',

    /**
     * @type {string} Roku IP address.
     *
     * ROKU_IP=127.0.0.1
     *
     * ROKU_IP=127.0.0.1 npm start
     * npm start -- --rokuIp=127.0.0.1
     */
    rokuIP: process.env.ROKU_IP || '',

    /**
     * @type {boolean} Enables telnet.
     *
     * TELNET=true|false
     *
     * TELNET=true npm start
     * npm start -- --telnet
     */
    telnet: process.env.TELNET === 'true',

    /**
     * @type {string} Unit test file/suite name.
     *
     * TEST_FILE_NAME=AppView
     *
     * TEST_FILE_NAME=AppView npm test
     * npm test -- --testFileName=AppView
     */
    testFileName: testFileName || process.env.TEST_FILE_NAME || '',

    /**
     * @type {boolean} Disable secured connections.
     *
     * FORCE_HTTP=true|false
     *
     * FORCE_HTTP=true npm start
     * npm start -- --forceHttp
     */
    forceHttp: process.env.FORCE_HTTP === 'true',
  },
});

module.exports = args;
