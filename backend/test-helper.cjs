const metaDataStr = "{\n  \"name\": \"twoSum\",\n  \"params\": [\n    {\n      \"name\": \"nums\",\n      \"type\": \"integer[]\"\n    },\n    {\n      \"name\": \"target\",\n      \"type\": \"integer\"\n    }\n  ],\n  \"return\": {\n    \"type\": \"integer[]\",\n    \"size\": 2\n  },\n  \"manual\": false\n}";
const testCasesList = [ '[2,7,11,15]\n9', '[3,2,4]\n6', '[3,3]\n6' ];

function generateTestCasesComment(metaDataStr, testCasesList) {
  try {
    const metaData = JSON.parse(metaDataStr);
    const paramNames = metaData.params.map(p => p.name);
    
    let comment = "\n\n/*\nExample Test Cases:\n";
    
    testCasesList.forEach((tc, index) => {
      comment += `\nTest ${index + 1}:\n`;
      const lines = tc.split('\n');
      lines.forEach((line, i) => {
        if (i < paramNames.length) {
          comment += `${paramNames[i]} = ${line}\n`;
        }
      });
    });
    
    comment += "*/\n";
    return comment;
  } catch(e) {
    return "";
  }
}

console.log(generateTestCasesComment(metaDataStr, testCasesList));
