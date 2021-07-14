# Kopytko Packager
A package builder for the Roku platform.

The packager consists of the following features:
- generate environment-specific manifest
- import internal and external brightscript dependencies
- pack & zip the files
- deploy the package to the Roku device
- run unit tests
- prepare and build an app for the Visual Studio Code [extension](https://github.com/RokuCommunity/vscode-brightscript-language)

## Listing
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Manifest file](#manifest-file)
- [Scripts](#scripts)
- [Plugins](#plugins)
- [Dependencies importing mechanism](#dependencies-importing-mechanism)
- [Configuration](#configuration)

## Prerequisites
- node version 14
- npm version 6

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
  "baseManifest": "/manifest/default.js",
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
- `baseManifest [@type string @required]` - base manifest file path. Having the file is sufficient to run the Roku app
- `localManifestOverride [@type string @optional]` - path to the configuration file that overrides all other settings. Usually the file is on the git ignore list
- `pluginDefinitions [@type [name: string]:object @optional` - plugin definitions (see [plugins](#plugins))
- `plugins @optional` - global plugins list (see [plugins](#plugins))
- `environments [@type [name: string]:object @optional]` - list of environments. The name should correspond to the `ENV` value. Each environment entry consists of:
  - `manifest [@type string @required]` - path to configuration file
  - `plugins` environment's plugins list (see [plugins](#plugins))
- `sourceDir [@type string @optional]` - directory of app's source code; default value as in the example file above
- `tempDir [@type string @optional]` - directory of a temporary folder used during a building process as a project directory. After build, it is removed; default value as in the example file above

The configuration files work in waterfall scheme meaning that `baseManifest` is loaded as the first file. Each environment entry overrides base configuration. The `localManifestOverride` is loaded as the last one overriding all others.

## Manifest file
Kopytko packager dynamically generates the manifest file by transpiling JavaScript configuration files,
so you don't have to keep it in the source code anymore.

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

## Scripts
The packager contains the following scripts:
- `scripts/build.js` - builds the app
- `scripts/start.js` - builds and deploys the app to the device
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

Plugins will be triggered during the build process of your project.

### Interface

1. Plugin has to be a function.
2. Plugin function arguments:
  1. The first argument is a temporary directory path.
     That directory contains all app files as they are in the source directory.
  2. The second argument is an environment string passed as a build/start/test script argument or ENV value from the .env file. If no environment was passed, then it is an empty string.

*example plugin code:*
```js
const glob = require('glob-promise');
const path = require('path');

module.exports = async function myPlugin(tempDir, env) {
  if (env === 'production') {
    const xmlFilePaths = await glob(path.join(tempDir, '/components/**/*.xml'));
    // do something with all XML files in your project during the package build process only for the production environment
  }
}
```

### Usage

In the Kopytko packager config file (**.kopytkorc**) plugins need to be defined first to be able to use it later.

Define a plugin in a `pluginDefinitions` config property, an object with a plugin name as a key and plugin function file path as a value.

The path will be added to the root directory path due to resolve this dependency (`<project_root_directory><plugin_path>`).

```json
{
  ...
  "pluginDefinitions": {
    "my-plugin": "/my-plugins/my-plugin/index.js"
  },
  ...
}
```

#### Global plugins

If a plugin should be executed each time the build process run, add its name to the `plugins` array property.

Custom plugin names have to be defined in the `pluginDefinitions` property.

```json
{
  ...
  "plugins": ["my-global-plugin"],
  ...
}
```

#### Environment plugins

If the plugin should be executed only on a specific environment, define it in the environment's `plugins` config property.

Custom plugin names have to be defined in the `pluginDefinitions` property.

```json
{
  ...
  "environments": {
    "production": {
      "plugins": ["my-custom-plugin", "my-production-plugin"]
    },
    "staging": {
      "plugins": ["my-custom-plugin"]
    },
    "test": {
      "plugins": ["my-test-plugin"]
    }
  }
  ...
}
```
### Execution order

The plugins execute in the following order:

1. All plugins defined in the global `plugins` array, that are objects containing preEnvironmentPlugin with value `true`, according to the order of the array.
2. All plugins defined in the environment `plugins` array, that are strings or objects containing postGlobalPlugin with value `false`, according to the order of the array.
3. All plugins defined in the global `plugins` array, that are strings or objects containing preEnvironmentPlugin with value `false`, according to the order of the array.
4. All plugins defined in the environment `plugins` array, that are objects containing postGlobalPlugin with value `true`, according to the order of the array.
5. All kopytko-packager built-in plugins. For now, it is only a plugin generating the manifest file.

*Example:*
```json
{
  ...
  "plugins": [
    { "name": "plugin-1", "preEnvironmentPlugin": true },
    { "name": "plugin-4", "preEnvironmentPlugin": false },
    "plugin-5"
  ],
  ...
  "environments": {
    "production": {
      "plugins": [
        "plugin-2",
        { "name": "plugin-3", "postGlobalPlugin": false },
        { "name": "plugin-6", "postGlobalPlugin": true }
      ]
    }
  }
  ...
}
```

Plugins from the example will execute in following order:
1. "plugin-1".
2. "plugin-2".
3. "plugin-3".
4. "plugin-4".
5. "plugin-5".
6. "plugin-6".

## Dependencies importing mechanism

Import dependencies from internal files and external NPM modules using the `@import` annotation.
Each of dependency will be automatically added as a `</script>` entry into the scope of XML file.
Nested dependencies and copying external NPM module files to the package supported.

### Configuration
Add predefined, built-in `kopytko-import-dependencies` and, if you use external libraries, `kopytko-copy-external-dependencies`
plugins into your .kopytkorc config file. We recommend configuring `kopytko-copy-external-dependencies` to be run before environment plugins:
 ```json
 "plugins": [
    { "name": "kopytko-copy-external-dependencies", "preEnvironmentPlugin": true },
    "kopytko-import-dependencies"
  ],
 ```

- `kopytko-copy-external-dependencies` copies all (even unused in the project) files from dependency modules
- `kopytko-import-depenencies` translates `@import` annotations and imports related dependencies in XML files

### Importing internal dependencies
Import other internal .brs file via `' @import /<path>` at the beginning of the file.
The `pkg:` prefix will be automatically added into the XML file.

Example:
```brightscript
' @import /components/utils.brs
' @import /source/superFunction.brs
function init()
end function
```

### Importing external dependencies
Import a .brs file from an external NPM module via `' @import /<path> from <package-name>`.
Every external dependency entry will be automatically added into the XML file with a proper path to the copied file.
kopytko-packager uses [ROPM library](https://github.com/rokucommunity/ropm) to copy files from external modules,
sanitize (normalize) their names and add module prefix to functions and components names.

[ROPM-supported](https://github.com/rokucommunity/ropm#creating-ropm-packages) modules should contain the `ropm` tag
in package.json and be defined as a dependency in the app's package.json file. Unless it's configured differently,
ropm will copy the majority directories from the package's root directory into specific directories
[with some exceptions](https://github.com/rokucommunity/ropm#changing-where-the-modules-files-are-copied-from-as-a-package-author).

By default, all functions and components will be renamed with a sanitized (normalized to Brightscript's requirements)
module name prefix. E.g. `function superFunction()` from `@kopytko/utils` will be renamed into `kopytko_utils_superFunction`.
You can find more details [here](https://github.com/rokucommunity/ropm#prefixes). If you want to
[avoid prefixing a specific package's files](https://github.com/rokucommunity/ropm#disabling-module-prefixing)
you can add such module name into `ropm.noprefix` array entry config in your package.json file.
Please be aware it may lead to naming collisions (e.g. an imported external module has defined a function with the name of
one of your internal functions).

Example:
```brightscript
' @import /components/externalUtil.brs from @kopytko/utils
```
will be changed into `pkg:/components/roku_modules/kopytko_utils/externalUtils.brs` XML script entry.

Kopytko-packager imports nested external dependencies out-of-the-box.

### Limitations
Despite ROPM supports multiple versions of a dependency, import statement ignores versioning and tries to import a file from a non-version-prefixed directory
