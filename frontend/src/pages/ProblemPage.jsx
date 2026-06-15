import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useProblems } from "../hooks/useProblems";
import Navbar from "../components/Navbar";
import { Loader2Icon } from "lucide-react";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import { executeCode } from "../lib/piston";

import toast from "react-hot-toast";
import confetti from "canvas-confetti";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: problemsData, isLoading } = useProblems();
  const problems = problemsData || [];

  const [currentProblemId, setCurrentProblemId] = useState(id || "");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  
  // Find current problem
  const currentProblem = problems.find(p => p._id === currentProblemId) || problems[0];

  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize code when problem loads
  useEffect(() => {
    if (currentProblem) {
      setCode(currentProblem.starterCode[selectedLanguage] || "");
    }
  }, [currentProblem, selectedLanguage]);

  // update problem when URL param changes
  useEffect(() => {
    if (id && problems.length > 0) {
      setCurrentProblemId(id);
      setOutput(null);
    }
  }, [id, problems]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) => navigate(`/problem/${newProblemId}`);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e']
    });
  };

  const normalizeOutput = (output) => {
    // normalize output for comparison (trim whitespace, handle different spacing, and normalize quotes)
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          // remove spaces after [ and before ]
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          // normalize spaces around commas to single space after comma
          .replace(/\s*,\s*/g, ",")
          // normalize single quotes to double quotes
          .replace(/'/g, '"')
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);

    return normalizedActual == normalizedExpected;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    // check if code executed successfully and matches expected output
    if (result.success) {
      const expectedOutput = currentProblem.expectedOutput[selectedLanguage];
      const testsPassed = checkIfTestsPassed(result.output, expectedOutput);
      
      // Update result with test status
      result.isCorrect = testsPassed;
      result.expectedOutput = expectedOutput;
      setOutput({...result});

      if (testsPassed) {
        triggerConfetti();
        toast.success("All tests passed! Great job!", {
          icon: '🎉',
          style: {
            borderRadius: '10px',
            background: '#10b981',
            color: '#fff',
          },
        });
      } else {
        toast.error("Tests failed. Check your output!", {
          style: {
            borderRadius: '10px',
            background: '#f43f5e',
            color: '#fff',
          },
        });
      }
    } else {
      toast.error("Code execution failed!", {
        style: {
          borderRadius: '10px',
          background: '#f43f5e',
          color: '#fff',
        },
      });
    }
  };

  if (isLoading) return <div className="min-h-screen bg-mesh flex items-center justify-center"><Loader2Icon className="animate-spin size-10 text-violet-400" /></div>;
  if (!currentProblem) return <div className="min-h-screen bg-mesh flex items-center justify-center text-lg font-bold">Problem not found</div>;

  return (
    <div className="h-screen bg-mesh flex flex-col overflow-hidden text-base-content relative">
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />
      <Navbar />
      
      <main className="flex-1 overflow-hidden p-2 relative z-10">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={problems}
            />
          </Panel>

          <PanelResizeHandle className="w-2 mx-1 rounded-full bg-white/5 hover:bg-violet-500/50 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="h-8 w-1 bg-white/20 rounded-full" />
          </PanelResizeHandle>

          {/* right panel- code editor & output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Top panel - Code editor */}
              <Panel defaultSize={70} minSize={30}>
                <div className="h-full bg-[#0d1117]/80 backdrop-blur-md rounded-2xl border border-white/10 m-2 shadow-xl overflow-hidden relative">
                  {/* Decorative glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] pointer-events-none" />
                  
                  <CodeEditorPanel
                    selectedLanguage={selectedLanguage}
                    code={code}
                    isRunning={isRunning}
                    onLanguageChange={handleLanguageChange}
                    onCodeChange={setCode}
                    onRunCode={handleRunCode}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 my-1 rounded-full bg-white/5 hover:bg-cyan-500/50 transition-colors cursor-row-resize flex items-center justify-center">
                <div className="w-8 h-1 bg-white/20 rounded-full" />
              </PanelResizeHandle>

              {/* Bottom panel - Output Panel*/}
              <Panel defaultSize={30} minSize={30}>
                <OutputPanel output={output} testcases={currentProblem.examples} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}

export default ProblemPage;
