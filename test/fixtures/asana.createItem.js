var nock = require('nock');

nock('https://app.asana.com:443')
  .post('/api/1.0/tasks')
  .reply(201, 
  {"data":{"id":19285005829315,"created_at":"2014-11-03T21:22:41.381Z","modified_at":"2014-11-03T21:22:41.381Z","name":"create test","notes":"this is a test\n\nextra line\n#foo bar\n#baz qux","completed":false,"assignee_status":"upcoming","completed_at":null,"due_on":null,"workspace":{"id":17620819608777,"name":"CrossCheck"},"num_hearts":0,"parent":null,"hearts":[],"followers":[{"id":87450240631,"name":"Marc Boscher"}],"assignee":null,"hearted":false,"tags":[],"projects":[{"id":17620819608778,"name":"#cc cctest issues"}]}}, 
  { server: 'nginx',
  date: 'Mon, 03 Nov 2014 21:22:41 GMT',
  'content-type': 'application/json; charset=UTF-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  'x-asana-content-string-length': '584',
  pragma: 'no-cache',
  'set-cookie': [ 'TooBusyRedirectCount=0' ],
  location: '/api/1.0/tasks/19285005829315',
  'cache-control': 'no-store',
  'x-server-name': 'prod-ws113.ec2',
  'x-asana-preferred-release-revision': '20141101_070023_96319d1d6b6075f0a9981a608447d94a8fe31d3d',
  'x-robots-tag': 'none',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'datacenter-time-end': '1415049761.723' });
