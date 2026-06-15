import axios from "axios";
import * as cheerio from "cheerio";

export const importFromLeetcode = async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug) {
      return res.status(400).json({ success: false, message: "LeetCode slug is required" });
    }

    // LeetCode GraphQL API endpoint
    const url = "https://leetcode.com/graphql";
    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          titleSlug
          content
          difficulty
          categoryTitle
          topicTags {
            name
          }
          metaData
          exampleTestcaseList
          codeSnippets {
            lang
            langSlug
            code
          }
        }
      }
    `;

    const response = await axios.post(url, {
      operationName: "questionData",
      variables: { titleSlug: slug },
      query,
    });

    const question = response.data?.data?.question;
    
    if (!question) {
      return res.status(404).json({ success: false, message: "Problem not found on LeetCode" });
    }

    // Parse HTML with cheerio to extract description, examples, and constraints
    let descriptionHtml = '';
    const constraints = [];
    const examples = [];
    
    if (question.content) {
      const $ = cheerio.load(question.content);
      
      let inDescription = true;
      $('body').children().each((i, el) => {
        const text = $(el).text();
        if (text.includes('Example 1:') || text.includes('Constraints:')) {
          inDescription = false;
        }
        if (inDescription) {
          descriptionHtml += $.html(el) + '\n';
        }
      });

      $('ul').each((i, ul) => {
        const prev = $(ul).prev('p');
        if (prev.text().includes('Constraints:')) {
          $(ul).find('li').each((j, li) => {
            constraints.push($(li).text().trim());
          });
        }
      });

      $('pre').each((i, pre) => {
        let text = $(pre).text();
        let inputMatch = text.match(/Input:\s*(.*?)\n/);
        let outputMatch = text.match(/Output:\s*(.*?)(?:\n|$)/);
        let explMatch = text.match(/Explanation:\s*(.*)/s);
        
        if (inputMatch && outputMatch) {
          examples.push({
            input: inputMatch[1].trim(),
            output: outputMatch[1].trim(),
            explanation: explMatch ? explMatch[1].trim() : ""
          });
        }
      });
    }

    // Generate test cases comment block
    let testCasesComment = "";
    try {
      if (question.metaData && question.exampleTestcaseList) {
        const metaData = JSON.parse(question.metaData);
        const paramNames = metaData.params.map(p => p.name);
        
        testCasesComment = "\n\n/*\nExample Test Cases:\n";
        question.exampleTestcaseList.forEach((tc, index) => {
          testCasesComment += `\nTest ${index + 1}:\n`;
          const lines = tc.split('\n');
          lines.forEach((line, i) => {
            if (i < paramNames.length) {
              testCasesComment += `${paramNames[i]} = ${line}\n`;
            }
          });
        });
        testCasesComment += "*/\n";
      }
    } catch (e) {
      console.error("Failed to parse metaData or test cases:", e);
    }

    // Find snippets and append test cases
    const jsSnippet = (question.codeSnippets?.find(s => s.langSlug === "javascript")?.code || "") + testCasesComment;
    const pySnippet = (question.codeSnippets?.find(s => s.langSlug === "python" || s.langSlug === "python3")?.code || "") + testCasesComment;
    const javaSnippet = (question.codeSnippets?.find(s => s.langSlug === "java")?.code || "") + testCasesComment;
    const cppSnippet = (question.codeSnippets?.find(s => s.langSlug === "cpp")?.code || "") + testCasesComment;

    const topicTags = question.topicTags?.map(t => t.name).join(" • ") || question.categoryTitle || "Algorithms";

    const mappedProblem = {
      title: question.title,
      difficulty: question.difficulty, // "Easy", "Medium", "Hard"
      category: topicTags,
      description: {
        text: descriptionHtml || question.content, // Cleaned HTML or fallback
        notes: ["Imported directly from LeetCode"]
      },
      examples: examples,
      constraints: constraints,
      hiddenTestCases: [], // Need manual setup or custom execution environment
      starterCode: {
        javascript: jsSnippet,
        python: pySnippet,
        java: javaSnippet,
        cpp: cppSnippet
      },
      expectedOutput: {
        javascript: "",
        python: "",
        java: "",
        cpp: ""
      }
    };

    res.status(200).json({ success: true, data: mappedProblem });
  } catch (error) {
    console.error("Error fetching from LeetCode:", error);
    res.status(500).json({ success: false, message: "Failed to fetch from LeetCode. They might be rate-limiting." });
  }
};

export const importFromGithub = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "GitHub raw URL is required" });
    }

    const response = await axios.get(url);
    const data = response.data;
    
    if (typeof data !== 'object') {
      return res.status(400).json({ success: false, message: "URL must return a JSON object matching the Problem schema." });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching from GitHub:", error);
    res.status(500).json({ success: false, message: "Failed to fetch from GitHub." });
  }
};
