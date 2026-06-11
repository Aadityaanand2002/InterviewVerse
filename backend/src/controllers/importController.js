import axios from "axios";

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

    // Map LeetCode data to our schema format
    
    // Find snippets
    const jsSnippet = question.codeSnippets?.find(s => s.langSlug === "javascript")?.code || "";
    const pySnippet = question.codeSnippets?.find(s => s.langSlug === "python" || s.langSlug === "python3")?.code || "";
    const javaSnippet = question.codeSnippets?.find(s => s.langSlug === "java")?.code || "";

    const mappedProblem = {
      title: question.title,
      difficulty: question.difficulty, // "Easy", "Medium", "Hard"
      category: question.categoryTitle || "Algorithms",
      description: {
        text: question.content, // Raw HTML from LeetCode
        notes: ["Imported directly from LeetCode"]
      },
      examples: [], // LeetCode examples are embedded inside the HTML content, so we leave this empty
      constraints: [], // Constraints are also embedded in the HTML content
      hiddenTestCases: [], // Need manual setup or custom execution environment
      starterCode: {
        javascript: jsSnippet,
        python: pySnippet,
        java: javaSnippet
      },
      expectedOutput: {
        javascript: "",
        python: "",
        java: ""
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
