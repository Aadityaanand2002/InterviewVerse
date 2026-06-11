import axiosInstance from "./axios";

/**
 * Executes code using our custom backend execution route
 * @param {string} language - programming language
 * @param {string} code - source code to executed
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const response = await axiosInstance.post("/execute", {
      language,
      code,
    });

    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        error: data.error,
      };
    }

    return {
      success: true,
      output: data.output || "No output",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || `Failed to execute code: ${error.message}`,
    };
  }
}
