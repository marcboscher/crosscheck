var nock = require('nock');

nock('https://api.github.com:443')
  .get('/repos/marcboscher/cctest/issues/38/comments')
  .reply(200, 

  [
    {
      "url": "https://api.github.com/repos/marcboscher/cctest/issues/comments/62577747",
      "html_url": "https://github.com/marcboscher/cctest/issues/38#issuecomment-62577747",
      "issue_url": "https://api.github.com/repos/marcboscher/cctest/issues/38",
      "id": 62577747,
      "user": {
        "login": "marcboscher",
        "id": 1174558,
        "avatar_url": "https://avatars.githubusercontent.com/u/1174558?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/marcboscher",
        "html_url": "https://github.com/marcboscher",
        "followers_url": "https://api.github.com/users/marcboscher/followers",
        "following_url": "https://api.github.com/users/marcboscher/following{/other_user}",
        "gists_url": "https://api.github.com/users/marcboscher/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/marcboscher/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/marcboscher/subscriptions",
        "organizations_url": "https://api.github.com/users/marcboscher/orgs",
        "repos_url": "https://api.github.com/users/marcboscher/repos",
        "events_url": "https://api.github.com/users/marcboscher/events{/privacy}",
        "received_events_url": "https://api.github.com/users/marcboscher/received_events",
        "type": "User",
        "site_admin": false
      },
      "created_at": "2014-11-11T16:55:10Z",
      "updated_at": "2014-11-11T16:55:10Z",
      "body": "comment\r\n"
    },
    {
      "url": "https://api.github.com/repos/marcboscher/cctest/issues/comments/62769547",
      "html_url": "https://github.com/marcboscher/cctest/issues/38#issuecomment-62769547",
      "issue_url": "https://api.github.com/repos/marcboscher/cctest/issues/38",
      "id": 62769547,
      "user": {
        "login": "marcboscher",
        "id": 1174558,
        "avatar_url": "https://avatars.githubusercontent.com/u/1174558?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/marcboscher",
        "html_url": "https://github.com/marcboscher",
        "followers_url": "https://api.github.com/users/marcboscher/followers",
        "following_url": "https://api.github.com/users/marcboscher/following{/other_user}",
        "gists_url": "https://api.github.com/users/marcboscher/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/marcboscher/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/marcboscher/subscriptions",
        "organizations_url": "https://api.github.com/users/marcboscher/orgs",
        "repos_url": "https://api.github.com/users/marcboscher/repos",
        "events_url": "https://api.github.com/users/marcboscher/events{/privacy}",
        "received_events_url": "https://api.github.com/users/marcboscher/received_events",
        "type": "User",
        "site_admin": false
      },
      "created_at": "2014-11-12T18:46:50Z",
      "updated_at": "2014-11-12T18:46:50Z",
      "body": "another comment\r\n\r\nover multiple lines"
    },
    {
      "url": "https://api.github.com/repos/marcboscher/cctest/issues/comments/62769730",
      "html_url": "https://github.com/marcboscher/cctest/issues/38#issuecomment-62769730",
      "issue_url": "https://api.github.com/repos/marcboscher/cctest/issues/38",
      "id": 62769730,
      "user": {
        "login": "marcboscher",
        "id": 1174558,
        "avatar_url": "https://avatars.githubusercontent.com/u/1174558?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/marcboscher",
        "html_url": "https://github.com/marcboscher",
        "followers_url": "https://api.github.com/users/marcboscher/followers",
        "following_url": "https://api.github.com/users/marcboscher/following{/other_user}",
        "gists_url": "https://api.github.com/users/marcboscher/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/marcboscher/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/marcboscher/subscriptions",
        "organizations_url": "https://api.github.com/users/marcboscher/orgs",
        "repos_url": "https://api.github.com/users/marcboscher/repos",
        "events_url": "https://api.github.com/users/marcboscher/events{/privacy}",
        "received_events_url": "https://api.github.com/users/marcboscher/received_events",
        "type": "User",
        "site_admin": false
      },
      "created_at": "2014-11-12T18:48:02Z",
      "updated_at": "2014-11-12T18:48:02Z",
      "body": "a comment\r\n\r\nover multiple lines\r\n\r\n#field1 aaa\r\n#field2"
    }
  ],


  //["1f8b0800000000000003ed97d16e9b3014865f25726f691d48081469da4b74375ba7c8310eb1646c641baa0ce5dd776c681a52b51b1117bd404a14c5f2ff7172627f985f2daab540193a585b990c6352f18782db43bd7ba0aac49a55cae09268ba53861e98c6945a662ce6c6d4cc60985332690dde44719224eb0405802ac57648bd207ecc5aa5779eda33ef2f907efc8a39b2d2550aa5f11c65afd800d5866994b548a8824be8c14569fddc304cd6719c068834c4127d5d811f347dbf1c8d2a69a11dbe7535eed3df9b6f2be015ba87b822100c7cda78471b347e4c6361ee5e09a15e80715df3f0ff7d77197c0e9e215c16b74120d8626561d56cdd754eae09","dcd8d125f9508bddc796e70e63a0ef9ae563cbea6350d48b847a5abfbc3dafde19aa7965b992a3cb1b8401a6744124ff436e8241d800c3efbbb13fcf8720cc1ab725c7a6bb548b2bcd1b428fae2d9a51c61be8f36dc4ab3800edb162b0f87fb88d075de7966d495ebacdb727c2b05380a866c4c215898579d1325cdf8721bc9ec24d16c759b8fc09b9bacaff3967a7f223107a973ceb67894ec174b24b368ff1c4b23b23a7955d879d65e78c7cedd45976a32d31cbaebbb9bf5b4ad3c92e7a0ad36c0dbefb4476c339bdec88f437dbc585f49cf8540363652d2caf045b082e9999da85c96a095e9eeee007d2ea9093bb10b0b30b6717ce07bfb727baaf7cf0eb3c9766cbe8e383df70ceab0bffc3824e8eee7db7e74ce4e18210f2f63542a7df7f01cf3c3c4f1e0f0000"], 

  { server: 'GitHub.com',
  date: 'Wed, 12 Nov 2014 19:05:38 GMT',
  'content-type': 'application/json; charset=utf-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  status: '200 OK',
  'x-ratelimit-limit': '5000',
  'x-ratelimit-remaining': '4999',
  'x-ratelimit-reset': '1415822738',
  'cache-control': 'private, max-age=60, s-maxage=60',
  etag: '"6f41e8c5ca937b7dd03761265e39ea0c"',
  'x-oauth-scopes': 'repo',
  'x-accepted-oauth-scopes': '',
  vary: 'Accept, Authorization, Cookie, X-GitHub-OTP',
  'x-github-media-type': 'github.v3; format=json',
  'x-xss-protection': '1; mode=block',
  'x-frame-options': 'deny',
  'content-security-policy': 'default-src \'none\'',
  'access-control-allow-credentials': 'true',
  'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
  'access-control-allow-origin': '*',
  'x-github-request-id': 'ADE76802:5F98:9F038CF:5463AF82',
  'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
  'x-content-type-options': 'nosniff',
  //'content-encoding': 'gzip',
  'x-served-by': '76d9828c7e4f1d910f7ba069e90ce976'
  });
