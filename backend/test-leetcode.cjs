const axios = require('axios');

async function test() {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        metaData
        exampleTestcaseList
        content
      }
    }
  `;
  const response = await axios.post("https://leetcode.com/graphql", {
    operationName: "questionData",
    variables: { titleSlug: "two-sum" },
    query,
  });
  console.log(JSON.stringify(response.data.data.question.metaData, null, 2));
  console.log(response.data.data.question.exampleTestcaseList);
}
test();
