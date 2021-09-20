const DependencyFinder = require('../dependency/dependency-finder');

const XML_SCRIPT_WITH_DEPENDENCY_REGEX = /<script.*uri="((?:pkg:)?[\w-/.]+\.brs)"/;

module.exports = class XmlDependencyFinder extends DependencyFinder {
  /**
   * Creates a brightscript dependency finder for SceneGraph xml files.
   * @param {XmlDependencyCreator} dependencyItemCreator
   */
  constructor(dependencyItemCreator) {
    super(XML_SCRIPT_WITH_DEPENDENCY_REGEX, dependencyItemCreator);
  }
}
