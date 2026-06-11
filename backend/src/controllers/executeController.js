import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";

const execAsync = promisify(exec);

export const executeCode = async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ success: false, error: "Language and code are required." });
  }

  // Create a temporary directory for execution
  const runId = crypto.randomUUID();
  const tmpDir = path.join(process.cwd(), "tmp", runId);
  
  try {
    await fs.mkdir(tmpDir, { recursive: true });

    let fileName, runCommand;

    if (language === "javascript") {
      fileName = "main.js";
      runCommand = `node ${fileName}`;
    } else if (language === "python") {
      fileName = "main.py";
      runCommand = `python3 ${fileName}`;
    } else if (language === "java") {
      fileName = "Main.java";
      runCommand = `javac ${fileName} && java Main`;
    } else {
      return res.status(400).json({ success: false, error: "Unsupported language." });
    }

    const filePath = path.join(tmpDir, fileName);
    await fs.writeFile(filePath, code);

    try {
      const { stdout, stderr } = await execAsync(runCommand, { cwd: tmpDir, timeout: 5000 });
      res.json({ success: true, output: stdout || stderr });
    } catch (execError) {
      // Execution failed (syntax error, runtime error, etc)
      res.json({ success: false, error: execError.stderr || execError.stdout || execError.message });
    }
  } catch (err) {
    console.error("Execution setup error:", err);
    res.status(500).json({ success: false, error: "Server failed to setup code execution." });
  } finally {
    // Cleanup
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.error("Failed to clean up:", cleanupErr);
    }
  }
};
