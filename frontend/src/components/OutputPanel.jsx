import { useState, useEffect } from "react";
import { TerminalIcon, CheckCircle2Icon } from "lucide-react";

function OutputPanel({ output, testcases = [] }) {
  const [activeTab, setActiveTab] = useState("testcases");

  // Switch to test result automatically when output comes in
  useEffect(() => {
    if (output) {
      setActiveTab("result");
    }
  }, [output]);

  return (
    <div className="h-full bg-base-100 flex flex-col rounded-lg overflow-hidden border border-base-300">
      {/* TABS */}
      <div className="flex bg-base-200 px-2 pt-2 border-b border-base-300 shrink-0 gap-2">
        <button
          onClick={() => setActiveTab("testcases")}
          className={`px-4 py-2 rounded-t-md text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "testcases"
              ? "bg-base-100 border-t-2 border-t-primary text-base-content"
              : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
          }`}
        >
          <CheckCircle2Icon className="size-4" />
          Testcases
        </button>
        <button
          onClick={() => setActiveTab("result")}
          className={`px-4 py-2 rounded-t-md text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === "result"
              ? "bg-base-100 border-t-2 border-t-primary text-base-content"
              : "text-base-content/60 hover:text-base-content hover:bg-base-300/50"
          }`}
        >
          <TerminalIcon className="size-4" />
          Test Result
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-base-100">
        {activeTab === "testcases" ? (
          <div>
            {testcases && testcases.length > 0 ? (
              <div className="space-y-4">
                {testcases.map((tc, idx) => (
                  <div key={idx} className="bg-base-200 p-3 rounded-md">
                    <p className="text-xs font-semibold text-base-content/60 mb-1">Case {idx + 1}</p>
                    <pre className="font-mono text-sm">{tc.input}</pre>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/50 text-sm mt-4 text-center">
                Refer to the problem description for test cases. (Custom input editing coming soon!)
              </p>
            )}
          </div>
        ) : (
          <div>
            {output === null ? (
              <p className="text-base-content/50 text-sm text-center mt-4">
                You must run your code first.
              </p>
            ) : (
              <div>
                <h3 className={`text-lg font-bold mb-4 ${
                  !output.success ? "text-error" :
                  output.isCorrect === false ? "text-error" : 
                  "text-success"
                }`}>
                  {!output.success ? "Runtime Error" : 
                   output.isCorrect === false ? "Wrong Answer" : 
                   "Accepted"}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-base-content/60 mb-1">Your Output</p>
                    <div className="bg-base-200 p-3 rounded-md">
                      <pre className={`font-mono text-sm whitespace-pre-wrap ${output.success ? "text-base-content" : "text-error"}`}>
                        {output.output || output.error || "No output"}
                      </pre>
                    </div>
                  </div>

                  {output.isCorrect === false && output.expectedOutput && (
                    <div>
                      <p className="text-xs font-semibold text-base-content/60 mb-1">Expected Output</p>
                      <div className="bg-base-200 p-3 rounded-md">
                        <pre className="font-mono text-sm whitespace-pre-wrap text-success">
                          {output.expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
