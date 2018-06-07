var nock = require('nock');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

module.exports = function (name, options) {
  // options tell us where to store our fixtures
  options = options || {};
  var testFolder = options.testFolder || 'test';
  var fixturesFolder = options.fixturesFolder || 'fixtures';
  var fp = path.join(testFolder, fixturesFolder, name + '.js');
  // `hasFixtures` indicates whether the test has fixtures we should read,
  // or doesn't, so we should record and save them.
  // the environment variable `NOCK_RECORD` can be used to force a new recording.
  var hasFixtures = !!process.env.NOCK_RECORD;

  return {
    // starts recording, or ensure the fixtures exist
    before: function () {
      if (!hasFixtures) {
        try { 
          require('../' + fp);
          hasFixtures = true;
        } catch (e) {
          nock.recorder.rec({
            "dont_print": true
            //output_objects: true
          });
        } 
      }
      else {
        hasFixtures = false;
        nock.recorder.rec({
          "dont_print": true
        });
      }
    },
    // saves our recording if fixtures didn't already exist
    after: function (done) {
      var fixtures;
      if (!hasFixtures) {
        fixtures = nock.recorder.play();
        var text = "var nock = require('nock');\n" + fixtures.join('\n');
        //nock.restore();
        fs.writeFile(fp, text, done);
      } else {
        //nock.done();
        done();
      }
    }
  };
};