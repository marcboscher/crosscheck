var nock = require('nock');

nock('https://app.asana.com:443')
  .get('/api/1.0/workspaces')
  .reply(200, 
    {"data":[{"id":87351479096,"name":"MicroSigns"},{"id":17620819608777,"name":"crosscheck.io"},{"id":498346170860,"name":"Personal Projects"}]}, 
    { server: 'nginx',
  date: 'Mon, 05 Jan 2015 18:20:55 GMT',
  'content-type': 'application/json; charset=UTF-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  'x-asana-content-string-length': '141',
  pragma: 'no-cache',
  'set-cookie': [ 'TooBusyRedirectCount=0' ],
  'cache-control': 'no-store',
  'x-server-name': 'prod-ws192.ec2',
  'x-asana-preferred-release-revision': '20150105_163842_a864d5abe3565df194a9234458e1b4707d4640a5',
  'x-robots-tag': 'none',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'datacenter-time-end': '1420482055.410' });
