var nock = require('nock');

nock('https://app.asana.com:443')
  .get('/api/1.0/tasks?project=17620819608778&opt_fields=id%2Cname%2Cnotes%2Cmodified_at%2Ccompleted%2Cassignee.name%2Cassignee.email%2Ctags.name%2Cprojects.name')
  .reply(200, 
  {
      "data": [
          {
              "id": 19039353279633,
              "modified_at": "2014-10-30T14:08:44.206Z",
              "name": "#32 Update test Wed Oct 29 2014 13:45:18 GMT-0400 (Eastern Daylight Time)",
              "notes": "9850\nLast updated on Wed Oct 29 2014 13:45:18 GMT-0400 (Eastern Daylight Time)\n#url https://github.com/marcboscher/cctest/issues/32\n#assignee \n#source gh\n#number 32\n#repo cctest\n#owner marcboscher\n#labels",
              "completed": false,
              "assignee": null,
              "tags": [],
              "projects": [
                  {
                      "id": 17620819608778,
                      "name": "#cc cctest issues"
                  }
              ]
          },
          {
              "id": 18976828653000,
              "modified_at": "2014-10-29T18:43:50.006Z",
              "name": "#34 another test from github",
              "notes": "#url https://github.com/marcboscher/cctest/issues/34\n#assignee \n#source gh\n#number 34\n#repo cctest\n#owner marcboscher\n#labels",
              "completed": false,
              "assignee": null,
              "tags": [],
              "projects": [
                  {
                      "id": 17620819608778,
                      "name": "#cc cctest issues"
                  }
              ]
          },
          {
              "id": 18971247737379,
              "modified_at": "2014-10-29T17:47:14.503Z",
              "name": "#30 Update test Fri Oct 24 2014 15:25:38 GMT-0400 (Eastern Daylight Time)",
              "notes": "7377\nLast updated on Fri Oct 24 2014 15:25:38 GMT-0400 (Eastern Daylight Time)\n#url https://github.com/marcboscher/cctest/issues/30\n#assignee \n#source gh\n#number 30\n#repo cctest\n#owner marcboscher\n#labels",
              "completed": false,
              "assignee": null,
              "tags": [],
              "projects": [
                  {
                      "id": 17620819608778,
                      "name": "#cc cctest issues"
                  }
              ]
          },
          {
              "id": 18663217857376,
              "modified_at": "2014-10-24T19:31:23.255Z",
              "name": "#29 closed issue test",
              "notes": "hellow world!!!\n\n*klgjeltjk*\n\n\n**dfhdkfjghdf**\n#url https://github.com/marcboscher/cctest/issues/29\n#assignee \n#source gh\n#number 29\n#repo cctest\n#owner marcboscher\n#labels",
              "completed": false,
              "assignee": null,
              "tags": [],
              "projects": [
                  {
                      "id": 17620819608778,
                      "name": "#cc cctest issues"
                  }
              ]
          },
          {
              "id": 18193431040338,
              "modified_at": "2014-11-03T19:47:19.930Z",
              "name": "Update test Mon Nov 03 2014 14:47:21 GMT-0500 (Eastern Standard Time)",
              "notes": "6953\nLast updated on Mon Nov 03 2014 14:47:21 GMT-0500 (Eastern Standard Time)",
              "completed": false,
              "assignee": null,
              "tags": [],
              "projects": [
                  {
                      "id": 17620819608778,
                      "name": "#cc cctest issues"
                  }
              ]
          },
          {
              "id": 18704113106162,
              "modified_at": "2014-10-29T18:41:47.663Z",
              "name": "#31 story test, new title",
              "notes": "change the description\n\nfoo bar\n\nchange the description again\n\nhellow world \n#url https://github.com/marcboscher/cctest/issues/31\n#assignee \n#source gh\n#number 31\n#repo cctest\n#owner marcboscher\n#labels",
              "completed": false,
              "assignee": null,
              "tags": [],
              "projects": [
                  {
                      "id": 17620819608778,
                      "name": "#cc cctest issues"
                  }
              ]
          },
          {
              "id": 18935613894395,
              "modified_at": "2014-10-29T18:42:01.526Z",
              "name": "#33 hello world",
              "notes": "#url https://github.com/marcboscher/cctest/issues/33\n#assignee \n#source gh\n#number 33\n#repo cctest\n#owner marcboscher\n#labels",
              "completed": false,
              "assignee": null,
              "tags": [],
              "projects": [
                  {
                      "id": 17620819608778,
                      "name": "#cc cctest issues"
                  }
              ]
          }
      ]
  },  
    //["1f8b0800000000000000cd96c96edb3010865f65a25c5ac30b372de4b9cba5690f7551a07150d0122dc9914543a41b0445debd23d945e426695c07280c5f287938e4fcdffca47e0699f63a50973f83320b1495844b1e7216cb88f361b0b259b9284df65dfb40058c5031a264c4c9940a451225c49891e85b300c6abd321871ce197c59634a03de380f5f4d069f520f4c423b19285722543481f717d3111184c0abb7da79d3d4f046df56655e7898962bf3ba4d693105e694494866f5070c834d973a035b1f9f79569f6f9a0a0aefd74e4d2679e98bcd7c9cdad564a59b746e5d5a986692a6edfe27a5731be3269ce12ced5c99d7c6008e9ddd34a981bcc071bd59cd4d035d4c63d616b673f1c9ded4f8472f2dbeabf4dc540ecbc315d795c16a02b5d09533c3e0f70281aa3755350cbcceb1fecbab61b06eecd2a4dedd738a2346122a2392c471722f7f9aee5687edce83bbabbbe16e4a22e3286149147242c85368999c52e4ca5548c6e40fb4023432c132b66c178d5dc156be1ead23c41507882b4e5f5cca441c73fcc9bf891b2b112b2ac621e17be2923ddfbc6bca6d778b5d77878a858aff936f7027f143df1c9df928df9003d09253471b459cd1380951d0e849b4624aa5e254313e6661d8478b27545a5987f277b93bc03d4c85a92a7b0337b6a9b2b3b3b3593dab07d755be34955f5e0fda477c31c8164576bd58e645b6180c8e41c1e4f328ba9893464125179c629b729e3c8e828e086f51b42e9363c9490f45df6117e8858ff60710bef38168a730baf541d8f7c167afeb4c37d903874532e40f1df692ccff5fd198084a51d28846ec994b81621d6334c3deb945c179dbdc76a20ea13637e04b5f999e4a69a1eb1c552f0c64c6a54db9f6a5edda7a612dcc75d30e1f0f029debb20bedbb048e3a8ae80147113df5fec76fb388f2440a2ec367683145e83864fb5738874ec8ad8e2fbbb5f9017af213d5f3eaee1730234facf80a0000"], 
  { server: 'nginx',
  date: 'Mon, 03 Nov 2014 21:00:45 GMT',
  'content-type': 'application/json; charset=UTF-8',
  'transfer-encoding': 'chunked',
  connection: 'close',
  //'content-encoding': 'gzip',
  //'x-asana-content-string-length': '2808',
  pragma: 'no-cache',
  'set-cookie': [ 'TooBusyRedirectCount=0' ],
  'cache-control': 'no-store',
  'x-server-name': 'ip-10-113-135-176',
  'x-asana-preferred-release-revision': '20141101_070023_96319d1d6b6075f0a9981a608447d94a8fe31d3d',
  'x-robots-tag': 'none',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'datacenter-time-end': '1415048445.338' });
