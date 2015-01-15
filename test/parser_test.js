/*global describe,it*/
'use strict';
var should = require("should"),
  parser = require("../lib/parser");

describe("parser.", function () {
  describe("normalizeLineEndings", function () {
    it("should support all variations of line breaks/feeds", function () {
      var inputText = "line 1\nline 2\n\rline 3\r\nline 4\rline 5\n\nprevious line was empty\n\r\nline 6",
        outputText,
        expectedText = "line 1\nline 2\nline 3\nline 4\nline 5\n\nprevious line was empty\n\nline 6";
      
      outputText = parser.normalizeLineEndings(inputText);
      //console.log(outputText);
      outputText.should.not.containEql("\r");
      outputText.should.be.exactly(expectedText);
    });
  }); 

  describe("extractFields", function () {
    it("should extract any variation of fields", function () {
      var fields = {
          "extra-field": "bar"
        },
        inputText = "#field1 value\nline 1\n#field2   \n\n#field3 value of field 3\nline 2 \nover multiple\n lines\n#a value of single character field\nline 3 with trailing white space   \n#final-field.at/end value of field at end",
        outputText,
        expectedText = "line 1\n\nline 2 \nover multiple\n lines\nline 3 with trailing white space",
        expectedFields = {
          "extra-field": "bar",
          "field1": "value",
          "field2": "",
          "field3": "value of field 3",
          "a": "value of single character field",
          "final-field.at/end" : "value of field at end"
        };
      
      outputText = parser.extractFields(inputText, fields);
      //console.log(outputText);
      outputText.should.be.exactly(expectedText);
    });

    it("should ignore lines that don't start with # + letter", function () {
      var fields = {},
        inputText = "prefix\n" +
          "##ignore value\n## ignore\n###ignore\n####ignore \n##### ignore \n" +
          " #ignore\n!ignore\n#1ignore\n#%ignore\n# ignore" +
          "suffix",
        outputText,
        expectedText = inputText,
        expectedFields = {};
      
      outputText = parser.extractFields(inputText, fields);
      //console.log(outputText);
      outputText.should.be.exactly(expectedText);
    });

    it("should ignore lines within code fence", function () {
      var fields = {},
        inputText = "prefix\n" +
          "#field1 value1\n" +
          "```\n#ignore1 value\nhdsghjdgh\n```\n" +
          "#field2 value2\n" +
          "foo bar\n",
        outputText,
        expectedText = "prefix\n" +
          "```\n#ignore1 value\nhdsghjdgh\n```\n" +
          "foo bar",
        expectedFields = {
          field1 : "value1",
          field2 : "value2"
        };
      
      outputText = parser.extractFields(inputText, fields);
      //console.log(outputText);
      outputText.should.be.exactly(expectedText);
    });

    it("should ignore lines within an unclosed code fence, and close it", function () {
      var fields = {},
        inputText = "prefix\n" +
          "#field1 value1\n" +
          "```\n#ignore1 value\nhdsghjdgh\n```\n" +
          "#field2 value2\n" +
          "foo bar\n" +
          "```ruby\nignore 2 value\nsuffix",
        outputText,
        expectedText = "prefix\n" +
          "```\n#ignore1 value\nhdsghjdgh\n```\n" +
          "foo bar\n" +
          "```ruby\nignore 2 value\nsuffix\n```",
        expectedFields = {
          field1 : "value1",
          field2 : "value2"
        };
      
      outputText = parser.extractFields(inputText, fields);
      //console.log(outputText);
      outputText.should.be.exactly(expectedText);
    });

    it("should deal with null text", function () {
      var fields = {},
        inputText = null,
        outputText,
        expectedText = "",
        expectedFields = {};
      
      outputText = parser.extractFields(inputText, fields);
      //console.log(outputText);
      outputText.should.be.exactly(expectedText);
    });

  });
 


  describe("serializeFields", function () {
    it("should convert all fields to a string", function () {
      var inputFields = {
          "extra-field": "bar",
          "field1": "value",
          "field2": "",
          "field3": "value of field 3",
          "!": "value of single character field",
          "final-field.at/end" : "value of field at end"
        },
        expectedString = "\n#extra-field bar\n#field1 value\n#field2 \n#field3 value of field 3\n#! value of single character field\n#final-field.at/end value of field at end",
        outputString;
      
      outputString = parser.serializeFields(inputFields);
      outputString.should.be.exactly(expectedString);
    });
  });



  describe("append", function () {
    it("should pad with 2 line breaks if none", function () {
      var bodyStr = "foo",
        fieldStr = "\n#extra-field bar\n#field1 value\n#field2 \n#field3 value of field 3\n#! value of single character field\n#final-field.at/end value of field at end",
        expectedStr = bodyStr + "\n\n" + fieldStr,
        outputStr;
      
      outputStr = parser.append(bodyStr, fieldStr);
      outputStr.should.be.exactly(expectedStr);
    });

    it("should pad with 1 line breaks if already has one", function () {
      var bodyStr = "foo\n",
        fieldStr = "\n#extra-field bar\n#field1 value\n#field2 \n#field3 value of field 3\n#! value of single character field\n#final-field.at/end value of field at end",
        expectedStr = bodyStr + "\n" + fieldStr,
        outputStr;
      
      outputStr = parser.append(bodyStr, fieldStr);
      outputStr.should.be.exactly(expectedStr);
    });

    it("should not pad with line breaks if already has two", function () {
      var bodyStr = "foo\n\n",
        fieldStr = "\n#extra-field bar\n#field1 value\n#field2 \n#field3 value of field 3\n#! value of single character field\n#final-field.at/end value of field at end",
        expectedStr = bodyStr + fieldStr,
        outputStr;
      
      outputStr = parser.append(bodyStr, fieldStr);
      outputStr.should.be.exactly(expectedStr);
    });

    it("should pad with only 2 line breaks if has more", function () {
      var bodyStr = "foo\n\n\n",
        fieldStr = "\n#extra-field bar\n#field1 value\n#field2 \n#field3 value of field 3\n#! value of single character field\n#final-field.at/end value of field at end",
        expectedStr = bodyStr.substring(0, bodyStr.length - 1) + fieldStr,
        outputStr;
      
      outputStr = parser.append(bodyStr, fieldStr);
      outputStr.should.be.exactly(expectedStr);
    });

  });
  
});
