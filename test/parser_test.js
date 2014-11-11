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
        inputText = "#field1 value\nline 1\n#field2   \n\n #field3 value of field 3\n# extract space after separator --> no field\nline 2 \nover multiple\n lines\n#! value of single character field\nline 3 with trailing white space   \n#final-field.at/end value of field at end",
        outputText,
        expectedText = "line 1\n\n# extract space after separator --> no field\nline 2 \nover multiple\n lines\nline 3 with trailing white space   ",
        expectedFields = {
          "extra-field": "bar",
          "field1": "value",
          "field2": "",
          "field3": "value of field 3",
          "!": "value of single character field",
          "final-field.at/end" : "value of field at end"
        };
      
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
  
});
