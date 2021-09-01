# Plugins

## Usage

In the Kopytko packager config file (**.kopytkorc**) plugins need to be defined first to be able to use it later,
unless it's a kopytko-packager pre-built plugin.

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

### Global plugins

If a plugin should be executed each time the build process run, add its name to the `plugins` array property.

Custom plugin names have to be defined in the `pluginDefinitions` property.

```json
{
  ...
  "plugins": ["my-global-plugin"],
  ...
}
```

### Environment plugins

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
## Execution order

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

## Writing custom plugins

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
