var nock = require('nock');

nock('https://api.github.com:443')
  .delete('/repos/marcboscher/cctest/issues/comments/62776366')
  .reply(204, "", { server: 'GitHub.com',
  date: 'Wed, 12 Nov 2014 20:25:44 GMT',
  connection: 'close',
  status: '204 No Content',
  'x-ratelimit-limit': '5000',
  'x-ratelimit-remaining': '4991',
  'x-ratelimit-reset': '1415826968',
  'x-oauth-scopes': 'repo',
  'x-accepted-oauth-scopes': '',
  'x-github-media-type': 'github.v3; format=json',
  'x-xss-protection': '1; mode=block',
  'x-frame-options': 'deny',
  'content-security-policy': 'default-src \'none\'',
  'access-control-allow-credentials': 'true',
  'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
  'access-control-allow-origin': '*',
  'x-github-request-id': 'ADE76802:706F:120D8104:5463C248',
  'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
  'x-content-type-options': 'nosniff',
  vary: 'Accept-Encoding',
  'x-served-by': '065b43cd9674091fec48a221b420fbb3' });
