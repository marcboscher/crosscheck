var nock = require('nock');

nock('https://app.asana.com:443')
  .put('/api/1.0/tasks/18193431040338')
  .reply(200, 
  {"data":{"id":18193431040338,"created_at":"2014-10-19T22:01:25.403Z","modified_at":"2014-11-03T21:10:47.454Z","name":"Update test Mon Nov 03 2014 16:10:49 GMT-0500 (Eastern Standard Time)","notes":"9140\nLast updated on Mon Nov 03 2014 16:10:49 GMT-0500 (Eastern Standard Time)","completed":false,"assignee_status":"upcoming","completed_at":null,"due_on":null,"workspace":{"id":17620819608777,"name":"CrossCheck"},"num_hearts":0,"parent":null,"hearts":[],"assignee":null,"hearted":false,"followers":[{"id":87450240631,"name":"Marc Boscher"}],"tags":[],"projects":[{"id":17620819608778,"name":"#cc cctest issues"}]}}, 
  { server: 'nginx',
  date: 'Mon, 03 Nov 2014 21:10:47 GMT',
  'content-type': 'application/json; charset=UTF-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  'x-asana-content-string-length': '615',
  pragma: 'no-cache',
  'set-cookie': [ 'TooBusyRedirectCount=0' ],
  'cache-control': 'no-store',
  'x-server-name': 'ip-10-144-237-229',
  'x-asana-preferred-release-revision': '20141101_070023_96319d1d6b6075f0a9981a608447d94a8fe31d3d',
  'x-robots-tag': 'none',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'datacenter-time-end': '1415049047.678' });
