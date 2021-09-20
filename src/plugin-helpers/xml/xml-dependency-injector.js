const XML_ADDED_DEPENDENCIES_SECTION_HEADER = '  <!-- auto-imported sub-dependencies -->';
const XML_COMPONENT_CLOSING_TAG = '</component>';

/**
 * DependencyInjector provides functionality to inject new file dependencies.
 */
module.exports = class XmlDependencyInjector {
  constructor(fileLines) {
    this._fileLines = fileLines;
  }

  /**
   * Returns updated file lines with SceneGraph script dependencies.
   * @param {DependencyCollection} dependencyCollection
   * @returns {Array<String>}
   */
  inject(dependencyCollection) {
    const linesToInject = this._getLinesToInject(dependencyCollection.getPaths());

    if (!linesToInject.length) {
      return this._fileLines;
    }

    let insertionIndex = this._fileLines.lastIndexOf(XML_COMPONENT_CLOSING_TAG);
    if (insertionIndex < 0) {
      insertionIndex = this._fileLines.findIndex(line => line.includes(XML_COMPONENT_CLOSING_TAG));
    }

    const updatedFileLines = [
      ...this._fileLines.slice(0, insertionIndex),
      ...linesToInject,
      ...this._fileLines.slice(insertionIndex),
    ];

    return updatedFileLines;
  }

  _getLinesToInject(dependencyPaths) {
    const newDependencyLines = dependencyPaths.map(dependencyPath => this._buildDependencyLine(dependencyPath));

    return [
      '',
      XML_ADDED_DEPENDENCIES_SECTION_HEADER,
      ...newDependencyLines,
    ];
  }

  _buildDependencyLine(dependencyPath) {
    return `  <script type="text/brightscript" uri="${dependencyPath}" />`;
  }
}
