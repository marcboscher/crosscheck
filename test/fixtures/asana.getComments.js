var nock = require('nock');

nock('https://app.asana.com:443')
  .get('/api/1.0/tasks/18704113106162/stories')
  .reply(200, 

  {
    "data": [
      {
        "id": 18704113106163,
        "created_at": "2014-10-26T15:17:58.310Z",
        "created_by": {
          "id": 87450240631,
          "name": "Marc Boscher"
        },
        "type": "system",
        "text": "added to #cc cctest issues"
      },
      {
        "id": 18704113106165,
        "created_at": "2014-10-26T15:18:55.240Z",
        "created_by": {
          "id": 87450240631,
          "name": "Marc Boscher"
        },
        "type": "comment",
        "text": "this is a comment"
      },
      {
        "id": 18955636053491,
        "created_at": "2014-10-29T15:22:46.232Z",
        "created_by": {
          "id": 87450240631,
          "name": "Marc Boscher"
        },
        "type": "system",
        "text": "changed the name to \"#31 story test, new title\""
      },
      {
        "id": 18955636053492,
        "created_at": "2014-10-29T15:22:46.257Z",
        "created_by": {
          "id": 87450240631,
          "name": "Marc Boscher"
        },
        "type": "system",
        "text": "changed the description"
      },
      {
        "id": 19877426323247,
        "created_at": "2014-11-11T18:02:14.339Z",
        "created_by": {
          "id": 87450240631,
          "name": "Marc Boscher"
        },
        "type": "comment",
        "text": "this is another comment"
      },
      {
        "id": 19877426323248,
        "created_at": "2014-11-11T18:02:39.772Z",
        "created_by": {
          "id": 87450240631,
          "name": "Marc Boscher"
        },
        "type": "comment",
        "text": "this comment has \nmultiple \n\nlines\n\nand some fields\n#fiedl1 foo\n#field2"
      }
    ]
  },

  //["1f8b0800000000000000b5d2dd4ac3301407f05709d9ed569aafa6cda5f7deed4a271293a30db4c96832748cbd8bcfe29399306582f30374d08bd3d3e4f4c79fb3c356278dd5f50e3b8b156965cd0961a46e48c3e6d84ca013d85b9db0c2b4267c41ea056d964428229568ab7cf20a1fcfdd6db13a4c6a251735e575c3c81c7b3d421e70a927832e42343d4c783fc769bb2eedb88d09c63c25c153f98fb6162c4a01cd8c41c6248809b9183710f3a5134ef1bdb355425459f267a709e3083e1da1a97731cb9046ef9f8ebe4e888635b560bc235ff9bae2a354f1a6a28cfe7b8ea6d7fea124d9032a374ba42b3c6304c514a62d2ac1ce918747945c1a60854ff3e96ff8429e956f219ac9ad930bfe88ec5a29396d58ce8ecb9348929f655e809a2ac22bc6ba33ee800f193a7dde848fcaf62725eb2a29ffbe09a7956f5dd4ebf8f2bcf2e366486e3d40a9577e701e6229b4b72886bc2df70e069b5bb35cd881a0fb100e2f83a5787fb37f0522fe7fae3b040000"], 

  { server: 'nginx',
  date: 'Tue, 11 Nov 2014 18:22:39 GMT',
  'content-type': 'application/json; charset=UTF-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  //'content-encoding': 'gzip',
  //'x-asana-content-string-length': '1081',
  pragma: 'no-cache',
  'set-cookie': [ 'TooBusyRedirectCount=0' ],
  'cache-control': 'no-store',
  'x-server-name': 'prod-ws194.ec2',
  'x-asana-preferred-release-revision': '20141110_233147_38708a26e5d0bd7dbcbb89a88d0ec39a435ee482',
  'x-robots-tag': 'none',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'datacenter-time-end': '1415730159.265' });
