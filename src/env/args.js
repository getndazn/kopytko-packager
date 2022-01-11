require('dotenv').config();
const minimist = require('minimist');

const firstArgument = process.argv[2] || '';
const anonymousArgument = !firstArgument.includes('--') ? firstArgument : '';
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
    env: process.env.ENV || 'dev',

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
     * @type {string} Roku Developer id.
     * It is required for device rekey and for generating production package.
     *
     * ROKU_DEV_ID=nkj3n4ij32n423i4jn23ij4ni23jn4
     *
     * ROKU_DEV_ID=nkj3n4ij32n423i4jn23ij4ni23jn4 run generate-package
     * npm run generate-package -- --rokuDevId=nkj3n4ij32n423i4jn23ij4ni23jn4
     */
    rokuDevId: process.env.ROKU_DEV_ID || '',

    /**
     * @type {string} Roku  Developer signing password.
     * It is required for device rekey and for generating production package.
     *
     * ROKU_DEV_SIGNING_PASSWORD=pass
     *
     * ROKU_DEV_SIGNING_PASSWORD=pass npm run generate-package
     * npm run generate-package -- --rokuDevSigningPassword=pass
     */
    rokuDevSigningPassword: process.env.ROKU_DEV_SIGNING_PASSWORD || '',

    /**
     * @type {string} Roku IP address.
     *
     * ROKU_IP=127.0.0.1
     *
     * ROKU_IP=127.0.0.1 npm start
     * npm start -- --rokuIP=127.0.0.1
     */
    rokuIP: process.env.ROKU_IP || '',

    /**
     * @type {string} Path for signed package.
     * It is required for device rekey.
     * It is a path relative to the root dir.
     *
     * SIGNED_PACKAGE_PATH=/packages/signed.pkg
     *
     * SIGNED_PACKAGE_PATH=/packages/signed.pkg npm run generate-package
     * npm run generate-package -- --signedPackagePath=/packages/signed.pkg
     */
    signedPackagePath: process.env.SIGNED_PACKAGE_PATH || '',

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
