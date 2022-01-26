# Kopytko Packager
A package builder for the Roku platform.

The packager consists of the following features:
- generate environment-specific manifest
- copy files of external modules ("Kopytko Modules") installed via NPM
- import internal and external brightscript dependencies
- pack & zip the files
- deploy a package to the Roku device
- rekey the Roku device with given signed package
- generate a package ready to upload to the Roku channel
- prepare and build an app for the Visual Studio Code [extension](https://github.com/RokuCommunity/vscode-brightscript-language)
- take a screenshot of the dev app

## Listing
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Plugins](#plugins)
  - [Generating manifest file](#generating-manifest-file)
  - [Copying external Kopytko Modules](#copying-external-kopytko-modules)
  - [Dependencies importing mechanism](#dependencies-importing-mechanism)
- [Creating Kopytko Module](#creating-kopytko-module)

## Prerequisites
- node version 16+
- npm version 7

## Quick start
1. Install the Packager
```
npm install @dazn/kopytko-packager --save-dev
```
2. Create `.kopytkorc` in the root folder with minimal configuration
```json
{
  "baseManifest": "manifest/base.js"
}
```
- If your app code is not located under default `/app`, configure it in a `sourceDir` attribute
- Path to base manifest is only example

3. Create a base manifest file
```js
const { baseManifest } = require('@dazn/kopytko-packager');

module.exports = {
  ...baseManifest,
  title: 'Your app title',
  mm_icon_focus_hd: 'pkg:/images/icon.png', // it is only an example path
  mm_icon_focus_sd: 'pkg:/images/icon.png',
  splash_screen_hd: 'pkg:/images/splash.png',
  splash_screen_sd: 'pkg:/images/splash.png',
}
```
4. Configure start script in your package.json
```json
"scripts": {
  "start": "node node_modules/@dazn/kopytko-packager/scripts/start.js"
}
```
5. Start the app
```
npm start
```

## Configuration
The main configuration file `.kopytkorc` should be placed in the root folder of the project. The example file looks like this:
```json
{
  "archivePath": "/dist/kopytko_archive.zip",
  "generatedPackagePath": "/dist/kopytko_package.pkg",
  "signedPackagePath": "/previous/signed.pkg",
  "baseManifest": "/manifest/base.js",
  "localManifestOverride": "/manifest/local.${args.env}.js",
  "screenshotDir": "/dist",
  "pluginDefinitions": {},
  "plugins": [],
  "sourceDir": "/app",
  "environments": {
    "production": {
      "manifest": "/env/production.js",
      "plugins": []
    },
    "staging": {
      "manifest": "/env/staging.js"
    },
    "test": {
      "manifest": "/env/test.js"
    }
  }
}
```
Available fields:
- `archivePath [@type string @optional]` - path to the app archive to generate; default value as in the example file above
- `generatedPackagePath [@type string @optional]` - path to the app package to generate; default value as in the example file above
- `baseManifest [@type string @required]` - base manifest file path. Having the file is sufficient to run the Roku app
- `localManifestOverride [@type string @optional]` - path to the configuration file that overrides all other settings. Usually the file is on the git ignore list
- `screenshotDir [@type string @optional]` - the directory where screenshots will be saved; default value as in the example file above
- `pluginDefinitions [@type [name: string]:object @optional]` - plugin definitions (see [plugins](#plugins))
- `plugins @optional` - global plugins list (see [plugins](#plugins))
- `environments [@type [name: string]:object @optional]` - list of environments. The name should correspond to the `ENV` value. Each environment entry consists of:
  - `manifest [@type string @required]` - path to configuration file
  - `plugins` environment's plugins list (see [plugins](#plugins))
- `sourceDir [@type string @optional]` - directory of app's source code; default value as in the example file above
- `tempDir [@type string @optional]` - absolute path of a temporary folder used during a building process as a project directory. After build, it is removed; default value is operating system directory for temporary files

archivePath and generatedPackagePath also could be defined as string templates to dynamically generate name of the created files.
Example of generatedPackagePath: 'MyApp-v${manifest.major_version}.${manifest.minor_version}.${manifest.build_version}-${args.env}.pkg'.
Resolves into: 'MyApp-v1.0.0-production.pkg'.
Above example will take values from given manifest file and arguments passed to the build or generate-package script.

The configuration files work in waterfall scheme meaning that `baseManifest` is loaded as the first file. Each environment entry overrides base configuration. The `localManifestOverride` is loaded as the last one overriding all others.

## Scripts
The packager contains the following scripts:
- `scripts/build.js` - builds the app
- `scripts/start.js` - builds and deploys the app to the device
- `scripts/generate-package.js` - rekey device if needed, builds, deploys the app to the device and finally signs and download the package
- `scripts/prepare-for-vsc.js` - helpful when using debugging protocol in the VSC [extension](https://github.com/RokuCommunity/vscode-brightscript-language)
- `scripts/screenshot.js` - takes a screenshot of the current dev application (works only with dev channel), screenshot file name - `Screenshot_<Date as ISOString>.jpg`

Example usage:
```json
"scripts": {
  "build-prod": "node node_modules/@dazn/kopytko-packager/scripts/build.js --env=production",
  "start": "node node_modules/@dazn/kopytko-packager/scripts/start.js"
}
```

Available parameters:
- `env` - your environment value that matches entry in the [.kopytkorc](#configuration) file. Default value (if not passed) is "dev"
- `rokuDevPassword` - dev password
- `rokuDevUser` - dev user
- `rokuDevId` - dev id, needed to rekey the device
- `rokuDevSigningPassword` - dev signing password needed to rekey the device and sign packages
- `rokuIP` - IP of your roku device
- `signedPackagePath` - path to the package of the existing app (signed package), needed to rekey the device
- `telnet` - true/false, when true the packager will open the telnet session after deploying app to the device
- `forceHttp` - true/false, when true all the urls in the manifest file that start with https will be overwritten to http

If an unnamed parameter is passed, it is treated as `env` parameter:
```
npm start -- production
# is a shortcut for:
npm start -- --env=production
```

### .env file
To avoid the necessity of passing parameter with every script run, a .env file could be used.
Documentation can be found [here](https://www.npmjs.com/package/dotenv).

Available fields: `ENV`, `ROKU_DEV_ID`, `ROKU_DEV_PASSWORD`, `ROKU_DEV_SIGNING_PASSWORD`, `ROKU_DEV_USER`, `ROKU_IP`, `SIGNED_PACKAGE_PATH`, `TELNET`, `FORCE_HTTP`

### Generate package script

By running this kopytko-packager will create a signed package.
This script automates [Packaging Roku channels](https://developer.roku.com/en-gb/docs/developer-program/publishing/packaging-channels.md)

It contains 4 steps:
- [rekey device (if needed)](https://developer.roku.com/en-gb/docs/developer-program/publishing/packaging-channels.md#rekeying)
- build an app for a given environment
- deploy an app to the Roku device
- [sign deployed app and download the generated package from the Roku device](https://developer.roku.com/en-gb/docs/developer-program/publishing/packaging-channels.md#step-4-packaging-the-sideloaded-channel)

Package will be saved under generatedPackagePath if it was provided in `.kopytkorc` file,
or in `/dist/kopytko_package.pkg` if generatedPackagePath was not provided.

To be able to generate the package following script arguments are required (or env variables):
- ROKU_DEV_ID
- ROKU_DEV_PASSWORD
- ROKU_DEV_SIGNING_PASSWORD
- ROKU_DEV_USER
- ROKU_IP
- SIGNED_PACKAGE_PATH

If you already have an app on your Roku channel, you will need to provide a previously signed package, to rekey the Roku device.
If this is your first version of the app and you don't have ROKU_DEV_ID and ROKU_DEV_SIGNING_PASSWORD yet:
1. [Open a telnet session](https://developer.roku.com/en-gb/docs/developer-program/publishing/packaging-channels.md#step-2-open-a-telnet-session)
2. [Generate new signing keys](https://developer.roku.com/en-gb/docs/developer-program/publishing/packaging-channels.md#step-3-run-the-genkey-utility-to-create-a-signing-key).

## Plugins

Plugin is a code triggered during the build process of a project. There are few built-in plugins,
one of them is executed regardless .kopytkorc config (kopytko-generate-manifest), but you can use and create
custom plugins. To get information how to configure or write your own plugin check [/docs/PLUGINS.md](/docs/PLUGINS.md).

Built-in plugins:

### Generating manifest file
Kopytko packager dynamically generates the manifest file by transpiling JavaScript configuration files,
so you don't have to keep it in the source code anymore. It is done by the kopytko-generate-manifest plugin,
configured out-of-the-box.

The example default manifest file:
```javascript
module.exports = {
  title: 'Some Title',
  bs_const: {
    debug: true,
  },
};
```
will be transpiled to a `manifest` file:
```
title=Some Title
bs_const=debug=true
```

You can override `@dazn/kopytko-packager/base-manifest.js` which contains all required by Roku fields and dynamically
sets app version based on your package.json.

### Copying external Kopytko Modules

`kopytko-copy-external-dependencies` plugin lets you use external Kopytko Modules. A Kopytko Module is an NPM module
with the `kopytko-module` keyword.
The plugin creates a dependency list based on your package prod dependencies (and their prod dependencies, recursively)
and direct dev dependencies (**without** their any dependencies). If your project in overall has dependencies
on the same module but in different versions, the plugin will automatically use only the highest version of every
major version dependency.
Once a dependency list is generated, the plugin automatically copies their `/components` and `/source` directories
(taking into account `kopytkoModuleDir` value configured in dependencies package.json file). So far the plugin **doesn't**
copies neither images nor fonts directories.

You can get the list of available public Kopytko Modules [here](https://www.npmjs.com/search?q=keywords%3Akopytko-module).
If you want to share your Roku library with the community and create your own Kopytko Module, check
the [Creating Kopytko Module](#creating-kopytko-module) paragraph.

The plugin creates

### Dependencies importing mechanism

Import dependencies from internal files and external Kopytko Modules using the `@import` annotation.
Each of dependency will be automatically added as a `</script>` entry into the scope of XML file.
Nested dependencies and copying external Kopytko Modules files to the package supported.

#### Configuration
Add predefined, built-in `kopytko-import-dependencies` and, if you use external Kopytko Modules, `kopytko-copy-external-dependencies`
plugins into your .kopytkorc config file. We recommend configuring `kopytko-copy-external-dependencies` to be run before environment plugins
so every next plugin can manipulate dependencies code if needed:
 ```json
 "plugins": [
    { "name": "kopytko-copy-external-dependencies", "preEnvironmentPlugin": true },
    "kopytko-import-dependencies"
  ],
 ```

- `kopytko-copy-external-dependencies` copies all (even unused in the project) files from dependency modules
- `kopytko-import-depenencies` translates `@import` annotations and imports related dependencies in XML files

#### Importing internal dependencies
Import other internal .brs file via `' @import /<path>` at the beginning of the file.
The `pkg:` prefix will be automatically added into the XML file.

Example:
```brightscript
' @import /components/utils.brs
' @import /source/superFunction.brs
function init()
end function
```

#### Importing external dependencies
Import a .brs file from an external Kopytko Module via `' @import /<path> from <package-name>`.
Every external dependency entry will be automatically added into the XML file with a proper path to the copied file.

All functions and components definitions and usages will be prefixed with a standardized module name and version
(normalized to Brightscript's requirements). E.g. `function superFunction()` from `@kopytko/utils` v1  will be renamed into `kopytko_utils_v1_superFunction`.
This mechanism prevents naming collisions (e.g. when an imported external module has defined a function with the same name as
one of your internal functions).

Example:
```brightscript
' @import /components/externalUtil.brs from @kopytko/utils
```
will be changed into `pkg:/components/kopytko_modules/kopytko_utils_v1/externalUtils.brs` XML script entry.

Kopytko-packager imports nested external dependencies out-of-the-box.

## Creating Kopytko Module
- add `"kopytko-module"` to "keywords" field in your module's package.json file
- if your `components` and `source` directories are not placed in the root directory, configure it in the
`"kopytkoModuleDir"` field in package.json, e.g. `"kopytkoModuleDir": "app/"`
- be aware so far Kopytko Module supports copying only the two mentioned above directories
- if your module is designed to be used as a direct dev dependency (e.g. a module for debugging the non-production app),
  and it uses some other Kopytko Modules, define them as `peerDependency` because Kopytko Packager doesn't install any dependencies
  of direct dev dependencies. Thanks to this, it will notify the end user to install your peer dependencies as dev dependencies too.
