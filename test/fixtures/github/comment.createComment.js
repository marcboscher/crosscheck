var nock = require('nock');

nock('https://api.github.com:443')
  .post('/repos/marcboscher/cctest/issues/38/comments')
  .reply(201, 

  {"url":"https://api.github.com/repos/marcboscher/cctest/issues/comments/62776366","html_url":"https://github.com/marcboscher/cctest/issues/38#issuecomment-62776366","issue_url":"https://api.github.com/repos/marcboscher/cctest/issues/38","id":62776366,"user":{"login":"marcboscher","id":1174558,"avatar_url":"https://avatars.githubusercontent.com/u/1174558?v=3","gravatar_id":"","url":"https://api.github.com/users/marcboscher","html_url":"https://github.com/marcboscher","followers_url":"https://api.github.com/users/marcboscher/followers","following_url":"https://api.github.com/users/marcboscher/following{/other_user}","gists_url":"https://api.github.com/users/marcboscher/gists{/gist_id}","starred_url":"https://api.github.com/users/marcboscher/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/marcboscher/subscriptions","organizations_url":"https://api.github.com/users/marcboscher/orgs","repos_url":"https://api.github.com/users/marcboscher/repos","events_url":"https://api.github.com/users/marcboscher/events{/privacy}","received_events_url":"https://api.github.com/users/marcboscher/received_events","type":"User","site_admin":false},"created_at":"2014-11-12T19:18:22Z","updated_at":"2014-11-12T19:18:22Z","body":"this is a test\n\nextra line\n\n\n#foo bar\n#baz qux"}, 
  { server: 'GitHub.com',
  date: 'Wed, 12 Nov 2014 19:18:22 GMT',
  'content-type': 'application/json; charset=utf-8',
  connection: 'close',
  status: '201 Created',
  'x-ratelimit-limit': '5000',
  'x-ratelimit-remaining': '4981',
  'x-ratelimit-reset': '1415822738',
  'cache-control': 'private, max-age=60, s-maxage=60',
  etag: '"e46727dd8d6e426700cbd15d1d4cc62c"',
  'x-oauth-scopes': 'repo',
  'x-accepted-oauth-scopes': '',
  location: 'https://api.github.com/repos/marcboscher/cctest/issues/comments/62776366',
  vary: 'Accept, Authorization, Cookie, X-GitHub-OTP',
  'x-github-media-type': 'github.v3; format=json',
  'x-xss-protection': '1; mode=block',
  'x-frame-options': 'deny',
  'content-security-policy': 'default-src \'none\'',
  'content-length': '1301',
  'access-control-allow-credentials': 'true',
  'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
  'access-control-allow-origin': '*',
  'x-github-request-id': 'ADE76802:5F99:D274537:5463B27E',
  'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
  'x-content-type-options': 'nosniff' });
