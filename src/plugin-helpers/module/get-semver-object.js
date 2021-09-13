module.exports = function getSemVerObject(version) {
  const parts = version.split('.');

  return {
    major: parseInt(parts[0]),
    minor: parseInt(parts[1]),
    patch: parseInt(parts[2]),
  }
}
