# Kopytko Packager
A package builder for the Roku platform.

The packager consists of the following features:
- generate environment-specific manifest
- copy files of external modules installed via NPM
- import internal and external brightscript dependencies
- pack & zip the files
- deploy a package to the Roku device
- prepare and build an app for the Visual Studio Code [extension](https://github.com/RokuCommunity/vscode-brightscript-language)

## Listing
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Manifest file](#manifest-file)
- [Scripts](#scripts)
- [Plugins](#plugins)
- [Dependencies importing mechanism](#dependencies-importing-mechanism)

## Prerequisites
- node version 14
- npm version 7

## Quick start
1. Install the Packager
```
npm install @kopytko/packager --save-dev
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
const baseManifest = require('@kopytko/packager/base-manifest.js');

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
  "start": "node node_modules/@kopytko/packager/scripts/start.js"
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
  "localManifestOverride": "/manifest/local.js",
  "pluginDefinitions": {},
  "plugins": [],
  "sourceDir": "/app",
  "tempDir": ".kopytkorc",
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
- `signedPackagePath [@type string @optional]` - path to the package of the existing app, needed to rekey the device;
- `baseManifest [@type string @required]` - base manifest file path. Having the file is sufficient to run the Roku app
- `localManifestOverride [@type string @optional]` - path to the configuration file that overrides all other settings. Usually the file is on the git ignore list
- `pluginDefinitions [@type [name: string]:object @optional]` - plugin definitions (see [plugins](#plugins))
- `plugins @optional` - global plugins list (see [plugins](#plugins))
- `environments [@type [name: string]:object @optional]` - list of environments. The name should correspond to the `ENV` value. Each environment entry consists of:
  - `manifest [@type string @required]` - path to configuration file
  - `plugins` environment's plugins list (see [plugins](#plugins))
- `sourceDir [@type string @optional]` - directory of app's source code; default value as in the example file above
- `tempDir [@type string @optional]` - directory of a temporary folder used during a building process as a project directory. After build, it is removed; default value as in the example file above

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

Example usage:
```json
"scripts": {
  "build-prod": "node node_modules/@kopytko/packager/scripts/build.js --env=production",
  "start": "node node_modules/@kopytko/packager/scripts/start.js"
}
```

Available parameters:
- `env` - your environment value that matches entry in the [.kopytkorc](#.kopytkorc-file) file. Default value (if not passed) is "dev"
- `rokuDevPassword` - dev password
- `rokuDevUser` - dev user
- `rokuDevId` - dev id, needed to rekey the device
- `rokuDevSigningPassword` - dev signing password needed to rekey the device and sign packages
- `rokuIP` - IP of your roku device
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

Available fields: `ENV`, `ROKU_DEV_PASSWORD`, `ROKU_DEV_USER`, `ROKU_IP`, `TELNET`, `FORCE_HTTP`

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

You can override `@kopytko/packager/base-manifest.js` which contains all required by Roku fields and dynamically
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
`"kopytkoPackageDir"` field in package.json, e.g. `"kopytkoPackageDir": "app/"`
- be aware so far Kopytko Module supports copying only the two mentioned above directories
- if your module is designed to be used as a direct dev dependency (e.g. a module for debugging the non-production app),
  and it uses some other Kopytko Modules, define them as `peerDependency` because Kopytko Packager doesn't install any dependencies
  of direct dev dependencies. Thanks to this, it will notify the end user to install your peer dependencies as dev dependencies too.
