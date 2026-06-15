import { useState, useEffect } from "react";
import { TerminalIcon, CheckCircle2Icon, PlayCircleIcon, AlertTriangleIcon, CheckIcon, XIcon } from "lucide-react";

function OutputPanel({ output, testcases = [] }) {
  const [activeTab, setActiveTab] = useState("testcases");
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);

  // Switch to test result automatically when output comes in
  useEffect(() => {
    if (output) {
      setActiveTab("result");
    }
  }, [output]);

  return (
    <div className="h-full bg-[#0d1117]/80 backdrop-blur-md flex flex-col rounded-2xl overflow-hidden border border-white/10 m-2 shadow-2xl">
      {/* TABS */}
      <div className="flex bg-[#161b22]/80 px-3 pt-3 border-b border-white/5 shrink-0 gap-2">
        <button
          onClick={() => setActiveTab("testcases")}
          className={`px-4 py-2.5 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "testcases"
              ? "bg-[#0d1117]/80 border-t-2 border-t-emerald-500 text-emerald-400 shadow-[0_-4px_10px_rgba(16,185,129,0.1)]"
              : "text-base-content/50 hover:text-base-content hover:bg-white/5"
          }`}
        >
          <CheckCircle2Icon className="size-4" />
          Testcases
        </button>
        <button
          onClick={() => setActiveTab("result")}
          className={`px-4 py-2.5 rounded-t-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "result"
              ? "bg-[#0d1117]/80 border-t-2 border-t-cyan-500 text-cyan-400 shadow-[0_-4px_10px_rgba(6,182,212,0.1)]"
              : "text-base-content/50 hover:text-base-content hover:bg-white/5"
          }`}
        >
          <TerminalIcon className="size-4" />
          Test Result
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto flex flex-col custom-scrollbar relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />

        {activeTab === "testcases" ? (
          <div className="flex-1 min-h-0 flex flex-col relative z-10">
            {testcases && testcases.length > 0 ? (
              <>
                {/* INNER TABS FOR EACH CASE */}
                <div className="flex gap-2 p-4 pb-0 shrink-0 overflow-x-auto border-b border-white/5 custom-scrollbar">
                  {testcases.map((tc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestCaseTab(idx)}
                      className={`px-4 py-1.5 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                        activeTestCaseTab === idx
                          ? "bg-white/5 text-emerald-400 border-emerald-500"
                          : "text-base-content/40 hover:text-base-content/70 hover:bg-white/5 border-transparent"
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>
                {/* ACTIVE TESTCASE CONTENT */}
                <div className="p-5 flex-1 min-h-0 overflow-y-auto">
                  <div className="space-y-5">
                    {testcases[activeTestCaseTab]?.input?.split('\n').map((line, i) => {
                      const parts = line.split(' = ');
                      if (parts.length === 2) {
                        return (
                          <div key={i} className="group">
                            <p className="text-[10px] font-bold text-base-content/40 mb-1.5 uppercase tracking-wider pl-1">{parts[0].trim()} =</p>
                            <div className="bg-[#161b22] border border-white/5 p-3.5 rounded-xl shadow-inner group-hover:border-emerald-500/20 transition-colors">
                              <pre className="font-mono text-sm whitespace-pre-wrap text-emerald-200">{parts[1].trim()}</pre>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={i} className="group">
                            <p className="text-[10px] font-bold text-base-content/40 mb-1.5 uppercase tracking-wider pl-1">Input {i + 1}</p>
                            <div className="bg-[#161b22] border border-white/5 p-3.5 rounded-xl shadow-inner group-hover:border-emerald-500/20 transition-colors">
                              <pre className="font-mono text-sm whitespace-pre-wrap text-emerald-200">{line}</pre>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="size-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <PlayCircleIcon className="size-6 text-base-content/30" />
                </div>
                <p className="text-base-content/50 text-sm font-medium">
                  Refer to the problem description for test cases.<br/>Custom input editing coming soon.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 relative z-10 p-5">
            {output === null ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="size-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 shadow-inner">
                  <TerminalIcon className="size-8 text-cyan-400" />
                </div>
                <p className="text-base-content/50 text-sm font-bold">
                  Run your code to see the results here.
                </p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-6 ${
                  !output.success 
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                  output.isCorrect === false 
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : 
                  "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}>
                  {!output.success ? <AlertTriangleIcon className="size-4" /> : 
                   output.isCorrect === false ? <XIcon className="size-4" /> : 
                   <CheckIcon className="size-4" />}
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    {!output.success ? "Runtime Error" : 
                     output.isCorrect === false ? "Wrong Answer" : 
                     "Accepted"}
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-base-content/40 mb-1.5 uppercase tracking-wider pl-1">Your Output</p>
                    <div className="bg-[#161b22] border border-white/5 p-4 rounded-xl shadow-inner relative overflow-hidden">
                      {output.success && output.isCorrect !== false && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50" />
                      )}
                      {(!output.success || output.isCorrect === false) && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-50" />
                      )}
                      <pre className={`font-mono text-sm whitespace-pre-wrap pl-2 ${
                        output.success ? "text-base-content/90" : "text-rose-400"
                      }`}>
                        {output.output || output.error || "No output"}
                      </pre>
                    </div>
                  </div>

                  {output.isCorrect === false && output.expectedOutput && (
                    <div className="animate-slide-up">
                      <p className="text-[10px] font-bold text-base-content/40 mb-1.5 uppercase tracking-wider pl-1">Expected Output</p>
                      <div className="bg-[#161b22] border border-white/5 p-4 rounded-xl shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50" />
                        <pre className="font-mono text-sm whitespace-pre-wrap text-emerald-300 pl-2">
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
