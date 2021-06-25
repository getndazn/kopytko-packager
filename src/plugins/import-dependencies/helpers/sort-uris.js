module.exports = function sortUris(uris) {
  uris.sort((a, b) => {
    const aParts = a.split('/');
    const bParts = b.split('/');

    let i = 0;
    while (aParts[i]) {
      const aPart = aParts[i];
      const bPart = bParts[i];

      if (aPart === bPart) {
        i++;
      } else {
        if (aParts[i+1] && !bParts[i+1]) {
          return 1;
        } else if (!aParts[i+1] && bParts[i+1]) {
          return -1;
        }

        return a.toLowerCase().localeCompare(b.toLowerCase());
      }
    }
  });

  return uris;
}
