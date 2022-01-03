const lodash = require('lodash');

const STRING_TEMPLATE_VARIABLE_REGEX = /\${([\w.]+)}/g;

function resolveStringTemplate(stringToResolve, stringTemplateResolveData) {
  return stringToResolve
    .replace(STRING_TEMPLATE_VARIABLE_REGEX, (_, key) => lodash.get(stringTemplateResolveData, key, ''));
}

module.exports = {
  resolveStringTemplate
}
