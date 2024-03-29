require('dotenv').config();

const minimist = require('minimist');

// runner parameter depends on script execution context
// example of kopytko script
// kopytko build --env=production
// '.../bin/node', or '...\\bin\\node.exe',
// '.../bin/kopytko', or '...\\bin\\kopytko.js',
// 'build',
// '--env=production'
//
// example of start npm build script
// npm build -- --env=production
// '.../bin/node',
// '.../@dazn/kopytko-packager/scripts/build.js',
// '--env=production'

const runner = process.argv[1]
// slice additional args if script is executed via kopytko command
const args = /kopytko(\.js)?$/.test(runner) ? process.argv.slice(3) : process.argv.slice(2);

const firstArgument = args[0] || '';
const anonymousArgument = !firstArgument.includes('--') ? firstArgument : '';
const env = process.env.ENV !== 'test' ? anonymousArgument : '';

const parsedArgs = minimist(args, {
  boolean: true,
  default: {
    /**
     * @type {string} Environment file name. Empty/non-existing value means default one.
     *
     *
     * ENV=production npm start
     * npm start -- --env=production
     * npm start -- production
     * ENV=production kopytko start
     * kopytko start --env=production
     * kopytko start production
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
     * @type {boolean} Disable secured connections.
     *
     * FORCE_HTTP=true|false
     *
     * FORCE_HTTP=true npm start
     * npm start -- --forceHttp
     */
    forceHttp: process.env.FORCE_HTTP === 'true',
  },
  string: [ 'rokuDevPassword' ],
});

module.exports = parsedArgs;
