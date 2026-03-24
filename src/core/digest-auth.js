const { createHash, randomBytes } = require('crypto');

function md5(str) {
  return createHash('md5').update(str).digest('hex');
}

function parseDigestChallenge(wwwAuthenticate) {
  const params = {};
  const regex = /(\w+)=(?:"([^"]+)"|([^\s,]+))/g;
  let match;
  while ((match = regex.exec(wwwAuthenticate)) !== null) {
    params[match[1]] = match[2] || match[3];
  }
  return params;
}

function buildDigestHeader({ username, password, realm, nonce, uri, method, qop, nc, cnonce, opaque }) {
  const ha1 = md5(`${username}:${realm}:${password}`);
  const ha2 = md5(`${method}:${uri}`);

  let response;
  if (qop) {
    response = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
  } else {
    response = md5(`${ha1}:${nonce}:${ha2}`);
  }

  let header = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}"`;
  if (qop) header += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
  if (opaque) header += `, opaque="${opaque}"`;

  return header;
}

function _buildDigestAuthHeader(wwwAuth, url, method, auth) {
  const challenge = parseDigestChallenge(wwwAuth);
  const urlObj = new URL(url);
  const uri = urlObj.pathname + urlObj.search;
  const nc = '00000001';
  const cnonce = md5(randomBytes(16).toString('hex'));

  return buildDigestHeader({
    username: auth.user,
    password: auth.pass,
    realm: challenge.realm,
    nonce: challenge.nonce,
    uri,
    method,
    qop: challenge.qop ? challenge.qop.split(',')[0].trim() : undefined,
    nc,
    cnonce,
    opaque: challenge.opaque,
  });
}

/**
 * Builds a multipart/form-data body from an array of fields.
 * Avoids Blob/File (experimental buffer.File in Node 22).
 *
 * @param {Array<{name: string, value: string|Buffer, filename?: string, contentType?: string}>} fields
 * @returns {{ body: Buffer, contentType: string }}
 */
function buildMultipartBody(fields) {
  const boundary = '----KopytkoBoundary' + Date.now() + randomBytes(8).toString('hex');
  const parts = [];

  for (const { name, value, filename, contentType } of fields) {
    let header = `--${boundary}\r\n`;
    if (filename) {
      header += `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n`;
      header += `Content-Type: ${contentType || 'application/octet-stream'}\r\n`;
    } else {
      header += `Content-Disposition: form-data; name="${name}"\r\n`;
    }
    header += '\r\n';
    parts.push(Buffer.from(header));
    parts.push(Buffer.isBuffer(value) ? value : Buffer.from(String(value)));
    parts.push(Buffer.from('\r\n'));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));

  return {
    body: Buffer.concat(parts),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

/**
 * Makes an HTTP request with Digest Authentication.
 *
 * @param {string} url
 * @param {Object} options - fetch options (method, body, headers, etc.)
 * @param {Object} auth - { user, pass }
 * @param {Object} [fetchOptions] - { resolveWithFullResponse, stream }
 * @returns {Promise<Response|{body: string}>}
 */
async function fetchWithDigestAuth(url, options, auth, fetchOptions = {}) {
  const initialResponse = await fetch(url, {
    ...options,
    headers: { ...options.headers },
  });

  if (initialResponse.status !== 401) {
    if (fetchOptions.resolveWithFullResponse) {
      return { body: await initialResponse.text(), status: initialResponse.status, response: initialResponse };
    }
    if (fetchOptions.stream) {
      return initialResponse;
    }
    return initialResponse.text();
  }

  const wwwAuth = initialResponse.headers.get('www-authenticate');
  if (!wwwAuth || !wwwAuth.toLowerCase().startsWith('digest')) {
    const error = new Error(`Authentication failed: ${initialResponse.status}`);
    error.statusCode = initialResponse.status;
    throw error;
  }

  const authHeader = _buildDigestAuthHeader(wwwAuth, url, options.method || 'GET', auth);

  const authedResponse = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': authHeader,
    },
  });

  if (!authedResponse.ok && authedResponse.status === 401) {
    const error = new Error('Bad Roku Developer credentials');
    error.statusCode = 401;
    throw error;
  }

  if (fetchOptions.resolveWithFullResponse) {
    return { body: await authedResponse.text(), status: authedResponse.status, response: authedResponse };
  }

  if (fetchOptions.stream) {
    return authedResponse;
  }

  return authedResponse.text();
}

/**
 * Sends a multipart form-data POST with Digest Auth.
 * Uses manual multipart body construction to avoid experimental buffer.File.
 *
 * @param {string} url
 * @param {Array<{name: string, value: string|Buffer, filename?: string, contentType?: string}>} fields
 * @param {Object} auth - { user, pass }
 * @param {Object} [fetchOptions] - { resolveWithFullResponse, stream }
 */
async function postFormWithDigestAuth(url, fields, auth, fetchOptions = {}) {
  // Step 1: empty POST to get the 401 + WWW-Authenticate challenge
  const challengeResponse = await fetch(url, { method: 'POST' });

  if (challengeResponse.status !== 401) {
    if (fetchOptions.resolveWithFullResponse) {
      return { body: await challengeResponse.text(), status: challengeResponse.status };
    }
    if (fetchOptions.stream) {
      return challengeResponse;
    }
    return challengeResponse.text();
  }

  const wwwAuth = challengeResponse.headers.get('www-authenticate');
  if (!wwwAuth || !wwwAuth.toLowerCase().startsWith('digest')) {
    const error = new Error(`Authentication failed: ${challengeResponse.status}`);
    error.statusCode = challengeResponse.status;
    throw error;
  }

  const authHeader = _buildDigestAuthHeader(wwwAuth, url, 'POST', auth);

  // Step 2: build multipart body and send with auth
  const { body, contentType } = buildMultipartBody(fields);

  const authedResponse = await fetch(url, {
    method: 'POST',
    body,
    headers: {
      'Authorization': authHeader,
      'Content-Type': contentType,
    },
  });

  if (!authedResponse.ok && authedResponse.status === 401) {
    const error = new Error('Bad Roku Developer credentials');
    error.statusCode = 401;
    throw error;
  }

  if (fetchOptions.resolveWithFullResponse) {
    return { body: await authedResponse.text(), status: authedResponse.status, response: authedResponse };
  }

  if (fetchOptions.stream) {
    return authedResponse;
  }

  return authedResponse.text();
}

module.exports = {
  fetchWithDigestAuth,
  postFormWithDigestAuth,
};
