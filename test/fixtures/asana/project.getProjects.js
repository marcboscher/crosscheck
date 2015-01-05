var nock = require('nock');

nock('https://app.asana.com:443')
  .get('/api/1.0/workspaces/17620819608777/projects?archived=false&opt_fields=id%2Cname%2Cnotes')
  .reply(200, 
    {
"data": [
    {
    "id": 22786784440038,
    "name": "test-project",
    "notes": ""
    },
    {
    "id": 23197538757236,
    "name": "Sprint 15-01",
    "notes": "Week of January 05 2015"
    },
    {
    "id": 20310630755061,
    "name": "Business",
    "notes": ""
    },
    {
    "id": 20836342231345,
    "name": "Marketing",
    "notes": ""
    },
    {
    "id": 17620819608782,
    "name": "Product Dev",
    "notes": ""
    },
    {
    "id": 20836342231408,
    "name": "Blog",
    "notes": ""
    },
    {
    "id": 20286318605086,
    "name": "High Level Plan",
    "notes": ""
    },
    {
    "id": 21918667384959,
    "name": "#gh cc-chrome",
    "notes": "#gh.repo crosscheck-chrome\ #gh.owner marcboscher"
    },
    {
    "id": 18935613894397,
    "name": "#gh cc-lib",
    "notes": "#gh.repo crosscheck\ #gh.owner marcboscher"
    },
    {
    "id": 17620819608778,
    "name": "#gh cctest",
    "notes": "#gh.repo cctest\ #gh.owner marcboscher"
    },
    {
    "id": 20915279817602,
    "name": "Site-wide SEO",
    "notes": "Site-wide SEO techniques can influence the entire website.\ \ Source: https://github.com/tutsplus/SEO-Checklist-for-Web-Designers"
    },
    {
    "id": 20915280230607,
    "name": "On-page SEO",
    "notes": "On-page SEO techniques optimize a single page for search engines.\ \ Source: http://webdesign.tutsplus.com/articles/seo-checklist--webdesign-10740"
    },
    {
    "id": 20915280310564,
    "name": "Off-site SEO",
    "notes": "SEO tactics that are beyond our website.\ \ Source: https://github.com/tutsplus/SEO-Checklist-for-Web-Designers"
    }
    ]
    }, 
    { server: 'nginx',
  date: 'Mon, 05 Jan 2015 18:36:58 GMT',
  'content-type': 'application/json; charset=UTF-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  //'content-encoding': 'gzip',
  //'x-asana-content-string-length': '1247',
  pragma: 'no-cache',
  'set-cookie': [ 'TooBusyRedirectCount=0' ],
  'cache-control': 'no-store',
  'x-server-name': 'prod-ws212.ec2',
  'x-asana-preferred-release-revision': '20150105_163842_a864d5abe3565df194a9234458e1b4707d4640a5',
  'x-robots-tag': 'none',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'datacenter-time-end': '1420483018.779' });

