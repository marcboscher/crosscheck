var nock = require('nock');

nock('https://app.asana.com:443')
  .post('/api/1.0/tasks')
  .reply(201, {"data":{"id":19926742567984,"created_at":"2014-11-11T22:24:03.684Z","modified_at":"2014-11-11T22:24:03.684Z","name":"create test","notes":"this is a test\n\nextra line\n\n\n#foo bar\n#baz qux","completed":false,"assignee_status":"upcoming","completed_at":null,"due_on":null,"workspace":{"id":17620819608777,"name":"CrossCheck"},"num_hearts":0,"parent":null,"hearts":[],"followers":[{"id":87450240631,"name":"Marc Boscher"}],"assignee":null,"hearted":false,"tags":[],"projects":[{"id":17620819608778,"name":"#cc cctest issues"}]}}, { server: 'nginx',
  date: 'Tue, 11 Nov 2014 22:24:03 GMT',
  'content-type': 'application/json; charset=UTF-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  'x-asana-content-string-length': '530',
  pragma: 'no-cache',
  'set-cookie': [ 'TooBusyRedirectCount=0' ],
  location: '/api/1.0/tasks/19926742567984',
  'cache-control': 'no-store',
  'x-server-name': 'prod-ws203.ec2',
  'x-asana-preferred-release-revision': '20141110_233147_38708a26e5d0bd7dbcbb89a88d0ec39a435ee482',
  'x-robots-tag': 'none',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'datacenter-time-end': '1415744643.981' });
