var nock = require('nock');

nock('https://app.asana.com:443')
  .post('/api/1.0/tasks/18704113106162/stories')
  .reply(201, {"data":{"id":19945806287041,"created_at":"2014-11-12T02:25:38.994Z","created_by":{"id":87450240631,"name":"Marc Boscher"},"target":{"id":18704113106162,"name":"#31 story test, new title"},"source":"api","type":"comment","text":"this is a test\n\nextra line\n\n\n#foo bar\n#baz qux","num_hearts":0,"hearts":[],"hearted":false}}, { server: 'nginx',
  date: 'Wed, 12 Nov 2014 02:25:39 GMT',
  'content-type': 'application/json; charset=UTF-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  'x-asana-content-string-length': '327',
  pragma: 'no-cache',
  'set-cookie': [ 'TooBusyRedirectCount=0' ],
  location: '/api/1.0/stories/19945806287041',
  'cache-control': 'no-store',
  'x-server-name': 'prod-ws034.ec2',
  'x-asana-preferred-release-revision': '20141111_233148_91fef8b425377e3979098e0608bdcb3c9ba75fb4',
  'x-robots-tag': 'none',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'datacenter-time-end': '1415759139.422' });
