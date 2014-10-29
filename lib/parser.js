'use strict';

var KEYWORD_PREFIX = "#",
  FIELD_SEPARATOR = " ",
  EMPTY_FIELD_VALUE = "",
  LINE_ENDING_REGEX = /\r\n|\n\r|\n|\r/g;


function normalizeLineEndings(text) {
  return text.replace(LINE_ENDING_REGEX, "\n");
}  
  
function extractFields(text, fields) {
  var lines,
    filteredLines;
  
  fields.should.be.type("object");

  lines = normalizeLineEndings(text).split("\n");

  // Filter out lines containing a field, keeps others.
  filteredLines = lines.filter(function (line) {
    var separatorIndex,
      fieldName,
      fieldValue;
    
    line = line.trim();
    
    if (line.charAt(0) !== KEYWORD_PREFIX) {
      return true;
    }
  
    // Minimum pattern is KEYWORD_PREFIX+a-character,
    // which could denote a 1-character field with an empty value
    if (line.length < 2) {
      return true;
    }

    separatorIndex = line.indexOf(FIELD_SEPARATOR);
    // If prefix is immediately followed by separator we have no field
    if (separatorIndex === 1) {
      return true;
    }

    // Assume we have a field with an empty value
    if (separatorIndex === -1) {
      fields[line.substring(1)] = EMPTY_FIELD_VALUE;
      return false;
    }

    // Got a field and value
    fields[line.substring(1, separatorIndex)] = line.substring(separatorIndex + 1);
    return false;
  });
  
  // Return the filtered text with normalized line endings
  return filteredLines.join("\n");
}  

module.exports = {
  normalizeLineEndings : normalizeLineEndings,
  extractFields : extractFields
};