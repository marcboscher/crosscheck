var nock = require('nock');

nock('https://app.asana.com:443')
  .get('/api/1.0/projects?archived=false&opt_fields=id%2Cname%2Cnotes%2Cworkspace')
  .reply(200, 
    {
      "data": [
        {
          "id": 5217646248498,
          "name": "House",
          "notes": "",
          "workspace": {
            "id": 498346170860
          }
        },
        {
          "id": 17530561828732,
          "name": "Crosscheck",
          "notes": "",
          "workspace": {
            "id": 498346170860
          }
        },
        {
          "id": 17620819608778,
          "name": "#cc cctest issues",
          "notes": "#source gh\n#repo cctest\n#owner marcboscher",
          "workspace": {
            "id": 17620819608777
          }
        },
        {
          "id": 17620819608782,
          "name": "Product Management",
          "notes": "",
          "workspace": {
              "id": 17620819608777
          }
        },
        {
          "id": 18935613894397,
          "name": "#cc github issues",
          "notes": "#source gh\n#repo crosscheck\n#owner marcboscher",
          "workspace": {
              "id": 17620819608777
          }
        },
      ]
    },
    { 
      server: 'nginx',
      date: 'Mon, 03 Nov 2014 19:56:13 GMT',
      'content-type': 'application/json; charset=UTF-8',
      'transfer-encoding': 'chunked',
      connection: 'close',
      //'content-encoding': 'gzip',
      //'x-asana-content-string-length': '3486',
      pragma: 'no-cache',
      'set-cookie': [ 'TooBusyRedirectCount=0' ],
      'cache-control': 'no-store',
      'x-server-name': 'ip-10-143-139-50',
      'x-asana-preferred-release-revision': '20141101_070023_96319d1d6b6075f0a9981a608447d94a8fe31d3d',
      'x-robots-tag': 'none',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'datacenter-time-end': '1415044573.663' 
    }
  );
