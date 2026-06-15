import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  useEndSession, 
  useJoinSession, 
  useSessionById, 
  useUpdateSessionProblem, 
  useUpdateSessionNotes,
  useUpdateSessionScore,
  useAskToJoin,
  useAdmitParticipant,
  useDenyParticipant,
  useAddTimelineEvent,
  useAddCodeSnapshot
} from "../hooks/useSessions";
import { useProblems } from "../hooks/useProblems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon, CopyIcon, MaximizeIcon, MessageSquareIcon, BookOpenIcon } from "lucide-react";
import toast from "react-hot-toast";

import { Chat, Channel, Window, MessageList, MessageInput } from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import OutputPanel from "../components/OutputPanel";
import ProblemDescription from "../components/ProblemDescription";
import InterviewTimer from "../components/InterviewTimer";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import MeetingSetup from "../components/MeetingSetup";
import Whiteboard from "../components/Whiteboard";
import CodeEditorPanel from "../components/CodeEditorPanel";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("code"); // 'code' or 'whiteboard'

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();
  const updateSessionProblemMutation = useUpdateSessionProblem();
  const updateSessionNotesMutation = useUpdateSessionNotes();
  const updateSessionScoreMutation = useUpdateSessionScore();

  const askToJoinMutation = useAskToJoin();
  const admitParticipantMutation = useAdmitParticipant();
  const denyParticipantMutation = useDenyParticipant();
  const addTimelineEventMutation = useAddTimelineEvent();
  const addCodeSnapshotMutation = useAddCodeSnapshot();

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id || session?.participants?.some(p => p?.clerkId === user?.id);

  const [camMicState, setCamMicState] = useState(() => {
    const saved = localStorage.getItem("interview-cam-mic-state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { isCamOn: true, isMicOn: true };
      }
    }
    return { isCamOn: true, isMicOn: true };
  });

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant,
    isSetupComplete,
    camMicState
  );

  const { data: problemsData } = useProblems();
  const problems = problemsData || [];

  // find the problem data based on session problem title
  const problemData = session?.problem
    ? problems.find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");
  const [notes, setNotes] = useState("");
  const [metrics, setMetrics] = useState({ communication: null, codeQuality: null, logic: null });
  const [overallRating, setOverallRating] = useState("");

  // Update notes state when session loads for the first time
  useEffect(() => {
    if (session?.evaluationNotes && !notes) {
      setNotes(session.evaluationNotes);
    }
  }, [session?.evaluationNotes]);

  // Update score state when session loads
  useEffect(() => {
    if (session?.metrics && metrics.communication === null) {
      setMetrics(session.metrics);
    }
    if (session?.overallRating && !overallRating) {
      setOverallRating(session.overallRating);
    }
  }, [session?.metrics, session?.overallRating]);

  // Completely lock the body scrolling to prevent whole-page stretching
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.height = "unset";
    };
  }, []);

  // Anti-cheat listeners
  useEffect(() => {
    if (!isParticipant || !channel) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        channel.sendEvent({
          type: "custom",
          proctoring_alert: {
            type: "tab_switch",
            timestamp: Date.now(),
            userName: user?.fullName || "Candidate",
          },
        });
        addTimelineEventMutation.mutate({
          id: id,
          data: { type: "TAB_SWITCH", message: `${user?.fullName || "Candidate"} switched tabs or minimized the window.` }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isParticipant, channel, user]);

  const handleCheatAlert = (action) => {
    if (!isParticipant || !channel) return;
    channel.sendEvent({
      type: "custom",
      proctoring_alert: {
        type: action,
        timestamp: Date.now(),
        userName: user?.fullName || "Candidate",
      },
    });
    addTimelineEventMutation.mutate({
      id: id,
      data: { type: action.toUpperCase(), message: `${user?.fullName || "Candidate"} triggered a ${action} alert.` }
    });
  };

  // Listen for proctoring alerts
  useEffect(() => {
    if (!channel) return;

    const handleCustomEvent = (event) => {
      if (event.type === "custom" && event.proctoring_alert) {
        if (isHost) {
          const { type, userName } = event.proctoring_alert;
          if (type === "tab_switch") {
            toast.error(`🚨 Warning: ${userName} switched browser tabs!`);
          } else if (type === "large_paste") {
            toast.error(`🚨 Warning: ${userName} pasted a large chunk of code!`);
          }
        }
      }
    };

    channel.on("custom", handleCustomEvent);
    return () => {
      channel.off("custom", handleCustomEvent);
    };
  }, [channel, isHost]);

  const handleSaveNotes = () => {
    updateSessionNotesMutation.mutate({ id, data: { evaluationNotes: notes } });
  };

  const handleSaveScore = () => {
    updateSessionScoreMutation.mutate({
      id,
      data: { metrics, overallRating },
    });
  };

  const handleProblemChange = (e) => {
    const newProblemTitle = e.target.value;
    const newProblemData = problems.find((p) => p.title === newProblemTitle);
    
    if (newProblemData) {
      updateSessionProblemMutation.mutate({ 
        id, 
        data: { problem: newProblemTitle, difficulty: newProblemData.difficulty.toLowerCase() }
      });
    }
  };

  // redirect logic when session ends
  useEffect(() => {
    if (!session || loadingSession || !user) return;
    if (session.status === "completed") {
      const isHost = session.host._id === user._id;
      if (isHost) {
        navigate(`/report/${session._id}`);
      } else {
        navigate("/dashboard");
      }
    }
  }, [session, loadingSession, navigate, user]);

  // Auto-complete setup for candidate when they are admitted
  useEffect(() => {
    if (isParticipant && session?.waitingParticipant === null) {
      if (!isHost) {
        setIsSetupComplete(true);
      }
    }
  }, [isParticipant, session?.waitingParticipant, isHost]);

  // update code when problem loads or changes
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
  };

  const normalizeOutput = (output) => {
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ",")
          .replace(/'/g, '"')
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
    if (!expectedOutput) return null; // No expected output available to compare
    const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);
    return normalizedActual == normalizedExpected;
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    
    if (result.success) {
      const expectedOutput = problemData?.expectedOutput?.[selectedLanguage];
      if (expectedOutput) {
        const testsPassed = checkIfTestsPassed(result.output, expectedOutput);
        result.isCorrect = testsPassed;
        result.expectedOutput = expectedOutput;
        
        if (testsPassed) {
          toast.success("All tests passed! Great job!");
        } else {
          toast.error("Tests failed. Check your output!");
        }
      } else {
        // If no expected output, just assume execution is accepted if it didn't throw error
        result.isCorrect = true;
      }
    } else {
      toast.error("Code execution failed!");
    }
    
    setOutput(result);
    setIsRunning(false);

    // Save snapshot of this run
    if (!isHost) {
      addCodeSnapshotMutation.mutate({
        id,
        data: {
          code,
          language: selectedLanguage,
          output: result.success ? result.output : result.error
        }
      });
    }
  };



  const handleSubmitHiddenTests = async () => {
    const hiddenTestCode = problemData?.hiddenTestCode?.[selectedLanguage];
    if (!hiddenTestCode) {
      toast.error("No hidden test cases configured for this problem and language.");
      return;
    }

    setIsRunning(true);
    setOutput(null);

    const codeToRun = code + "\n\n" + hiddenTestCode;
    const result = await executeCode(selectedLanguage, codeToRun);

    if (result.success) {
      const expectedOutput = problemData?.hiddenExpectedOutput?.[selectedLanguage];
      if (expectedOutput) {
        const testsPassed = checkIfTestsPassed(result.output, expectedOutput);
        result.isCorrect = testsPassed;
        result.expectedOutput = expectedOutput;

        if (testsPassed) {
          toast.success("🎉 All Hidden Tests Passed!");
        } else {
          toast.error("❌ Hidden Tests Failed.");
        }
      } else {
        result.isCorrect = true;
      }
    } else {
      toast.error("Execution failed during hidden tests!");
    }

    setOutput(result);
    setIsRunning(false);
  };

  const handleFullscreen = () => {
    const elem = document.getElementById("left-panel-content");
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch((err) => {
          toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard or report
      endSessionMutation.mutate({ 
        id, 
        data: { finalCode: code, finalLanguage: selectedLanguage }
      }, { onSuccess: () => navigate(`/report/${id}`) });
    }
  };

  if (loadingSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <Loader2Icon className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <MeetingSetup 
        session={session}
        isHost={isHost}
        isParticipant={isParticipant}
        onJoin={(prefs) => {
          setCamMicState(prefs);
          setIsSetupComplete(true);
        }}
        onAskToJoin={(prefs) => {
          setCamMicState(prefs);
          askToJoinMutation.mutate(id);
        }}
        askToJoinPending={askToJoinMutation.isPending}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-mesh flex flex-col overflow-hidden text-base-content relative">
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />
      <Navbar />

      {/* ADMIT PARTICIPANT BANNER FOR HOST */}
      {isHost && session?.waitingParticipant && (
        <div className="bg-warning/20 border-b border-warning/50 p-3 flex items-center justify-between px-6 shrink-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-base-200">
              <img 
                src={session.waitingParticipant.profileImage || `https://ui-avatars.com/api/?name=${session.waitingParticipant.name}`} 
                alt="Waiting" 
              />
            </div>
            <p className="font-semibold text-warning-content">
              {session.waitingParticipant.name} is asking to join the interview.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-sm btn-success"
              onClick={() => admitParticipantMutation.mutate(id)}
              disabled={admitParticipantMutation.isPending}
            >
              Admit
            </button>
            <button 
              className="btn btn-sm btn-error"
              onClick={() => denyParticipantMutation.mutate(id)}
              disabled={denyParticipantMutation.isPending}
            >
              Deny
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0 relative w-full p-2 z-10">
        <div className="absolute inset-0 p-2">
          <PanelGroup direction="horizontal" className="h-full w-full">
            
            {/* PANEL 1 - PROBLEM DETAILS & HOST CONTROLS */}
            <Panel defaultSize={25} minSize={20}>
              <div className="h-full flex flex-col bg-base-100/30 backdrop-blur-sm rounded-2xl border border-white/10 m-1 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] pointer-events-none" />
                
                {/* HEADER SECTION */}
                <div className="p-4 md:p-6 bg-[#0d1117]/60 border-b border-white/5 shrink-0 relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {isHost ? (
                        <select
                          className="select select-sm w-full"
                          value={problemData?.title || ""}
                          onChange={handleProblemChange}
                        >
                          <option value="" disabled>Select a problem</option>
                          {problems.map((p) => (
                            <option key={p.title} value={p.title}>
                              {p.title} - {p.difficulty}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <h1 className="text-xl md:text-3xl font-bold text-base-content">
                          {session?.problem || "Loading..."}
                        </h1>
                      )}
                      {problemData?.category && (
                        <p className="text-base-content/60 mt-1">{problemData.category}</p>
                      )}
                      <p className="text-base-content/60 mt-2">
                        Host: {session?.host?.name || "Loading..."} •{" "}
                        {session?.participant ? 2 : 1}/2 participants
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${getDifficultyBadgeClass(
                          session?.difficulty
                        )}`}
                      >
                        {session?.difficulty || "EASY"}
                      </span>
                      {isHost && session?.status === "active" && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Invite link copied!", {
                              style: { background: "rgba(16, 185, 129, 0.1)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.2)" },
                            });
                          }}
                          className="btn btn-outline border-white/10 hover:bg-white/5 text-base-content/80 btn-xs md:btn-sm gap-1 md:gap-2"
                        >
                          <CopyIcon className="w-3 h-3 md:w-4 md:h-4" />
                          Copy Link
                        </button>
                      )}
                      {isHost && session?.status === "active" && problemData?.solutionCode?.[selectedLanguage] && (
                        <button
                          onClick={() => document.getElementById('solution_modal').showModal()}
                          className="btn btn-outline border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 btn-xs md:btn-sm gap-1 md:gap-2"
                        >
                          View Solution
                        </button>
                      )}
                      {isHost && session?.status === "active" && (
                        <button
                          onClick={handleEndSession}
                          disabled={endSessionMutation.isPending}
                          className="btn bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 btn-xs md:btn-sm gap-1 md:gap-2"
                        >
                          {endSessionMutation.isPending ? (
                            <Loader2Icon className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                          ) : (
                            <LogOutIcon className="w-3 h-3 md:w-4 md:h-4" />
                          )}
                          End Session
                        </button>
                      )}
                      {session?.status === "completed" && (
                        <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-base-content/10 text-base-content/60">Completed</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden min-h-0 relative z-10">
                  <ProblemDescription
                    problem={
                      problemData || {
                        title: "To be assigned",
                        difficulty: "Easy",
                        category: "TBD",
                        description: { text: "Waiting for the interviewer to assign a problem...", notes: [] },
                        examples: [],
                        constraints: [],
                      }
                    }
                    currentProblemId={problemData?.title || ""}
                    onProblemChange={isHost ? handleProblemChange : null}
                    allProblems={problems}
                  />
                </div>

                {/* EVALUATION NOTES + SCORING (HOST ONLY) */}
                {isHost && (
                  <div className="bg-[#0d1117]/80 p-4 md:p-5 border-t border-white/5 shrink-0 flex flex-col gap-4 relative z-10">
                    {/* Score row */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 bg-base-200/50 px-3 py-1.5 rounded-xl border border-white/5">
                          <span className="text-xs font-bold text-base-content/70">Comm:</span>
                          <input
                            type="number" min={1} max={10}
                            className="w-12 bg-transparent border-none focus:ring-0 text-sm font-mono text-center outline-none"
                            placeholder="-"
                            value={metrics.communication ?? ""}
                            onChange={(e) => setMetrics(m => ({ ...m, communication: e.target.value ? Number(e.target.value) : null }))}
                          />
                          <span className="text-[10px] text-base-content/30">/10</span>
                        </div>
                        <div className="flex items-center gap-2 bg-base-200/50 px-3 py-1.5 rounded-xl border border-white/5">
                          <span className="text-xs font-bold text-base-content/70">Logic:</span>
                          <input
                            type="number" min={1} max={10}
                            className="w-12 bg-transparent border-none focus:ring-0 text-sm font-mono text-center outline-none"
                            placeholder="-"
                            value={metrics.logic ?? ""}
                            onChange={(e) => setMetrics(m => ({ ...m, logic: e.target.value ? Number(e.target.value) : null }))}
                          />
                          <span className="text-[10px] text-base-content/30">/10</span>
                        </div>
                        <div className="flex items-center gap-2 bg-base-200/50 px-3 py-1.5 rounded-xl border border-white/5">
                          <span className="text-xs font-bold text-base-content/70">Code:</span>
                          <input
                            type="number" min={1} max={10}
                            className="w-12 bg-transparent border-none focus:ring-0 text-sm font-mono text-center outline-none"
                            placeholder="-"
                            value={metrics.codeQuality ?? ""}
                            onChange={(e) => setMetrics(m => ({ ...m, codeQuality: e.target.value ? Number(e.target.value) : null }))}
                          />
                          <span className="text-[10px] text-base-content/30">/10</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Rating:</span>
                        <select
                          className="px-3 py-1.5 bg-base-200/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm appearance-none cursor-pointer"
                          value={overallRating}
                          onChange={(e) => setOverallRating(e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          <option value="Selected">Selected</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <button
                        className="px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold hover:bg-emerald-500/20 transition-colors"
                        onClick={handleSaveScore}
                        disabled={updateSessionScoreMutation.isPending}
                      >
                        {updateSessionScoreMutation.isPending ? "Saving..." : "Save Score"}
                      </button>
                    </div>

                    {/* Notes */}
                    <details className="group">
                      <summary className="text-sm font-bold text-violet-400 flex items-center justify-between shrink-0 uppercase tracking-wider cursor-pointer select-none outline-none hover:bg-white/5 p-2 rounded-lg transition-colors">
                        <span className="flex items-center gap-2">📝 Private Evaluation Notes</span>
                        <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-3 flex flex-col gap-3">
                        <textarea
                          className="w-full h-24 p-3 bg-base-200/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm resize-none custom-scrollbar"
                          placeholder="Write your private notes about the candidate here."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                        <button 
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-base-content/80 text-sm font-bold hover:bg-white/10 transition-colors self-start shrink-0"
                          onClick={handleSaveNotes}
                          disabled={updateSessionNotesMutation.isPending}
                        >
                          {updateSessionNotesMutation.isPending ? "Saving..." : "Save Notes"}
                        </button>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

            {/* PANEL 2 - CODE EDITOR */}
            <Panel defaultSize={50} minSize={30}>
              <div className="flex flex-col h-full w-full bg-base-100/30 backdrop-blur-sm rounded-2xl border border-white/10 m-1 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
                {/* MODE TOGGLE */}
                <div className="flex items-center justify-between p-3 bg-[#161b22]/90 backdrop-blur-md border-b border-white/5 shrink-0 relative z-10">
                  <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                    <button 
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "code" ? "bg-white/10 text-cyan-400 shadow-sm" : "text-base-content/50 hover:text-base-content/80 hover:bg-white/5"}`}
                      onClick={() => setActiveTab("code")}
                    >
                      Code Editor
                    </button>
                    <button 
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "whiteboard" ? "bg-white/10 text-cyan-400 shadow-sm" : "text-base-content/50 hover:text-base-content/80 hover:bg-white/5"}`}
                      onClick={() => setActiveTab("whiteboard")}
                    >
                      Whiteboard
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Timer */}
                    <InterviewTimer startedAt={session?.startedAt || session?.createdAt} />
                    
                    <button 
                      className="btn btn-sm btn-ghost btn-square" 
                      onClick={handleFullscreen}
                      title="Toggle Fullscreen"
                    >
                      <MaximizeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative w-full min-h-0 overflow-hidden">
                  <div className="absolute inset-0">
                    {activeTab === "code" ? (
                      <PanelGroup direction="vertical" className="h-full w-full">
                        <Panel defaultSize={70} minSize={30}>
                          <CodeEditorPanel
                            selectedLanguage={selectedLanguage}
                            code={code}
                            isRunning={isRunning}
                            onLanguageChange={handleLanguageChange}
                            onCodeChange={(value) => setCode(value)}
                            onRunCode={handleRunCode}
                            onSubmit={handleSubmitHiddenTests}
                            onCheatAlert={handleCheatAlert}
                            sessionId={id}
                            isCollaborative={true}
                          />
                        </Panel>

                        <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                        <Panel defaultSize={30} minSize={15}>
                          <OutputPanel output={output} testcases={problemData?.examples || []} />
                        </Panel>
                      </PanelGroup>
                    ) : (
                      <Whiteboard roomId={id} />
                    )}
                  </div>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

            {/* PANEL 3 - VIDEO CALLS & CHAT */}
            <Panel defaultSize={25} minSize={20}>
              <div className="h-full bg-base-200 p-4 overflow-auto rounded-2xl m-1 border border-white/10">
                {isInitializingCall ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                      <p className="text-lg">Connecting to video call...</p>
                    </div>
                  </div>
                ) : !streamClient || !call ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="card bg-base-100 shadow-xl max-w-md">
                      <div className="card-body items-center text-center">
                        <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                          <PhoneOffIcon className="w-12 h-12 text-error" />
                        </div>
                        <h2 className="card-title text-2xl">Connection Failed</h2>
                        <p className="text-base-content/70">Unable to connect to the video call</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <StreamVideo client={streamClient}>
                      <StreamCall call={call}>
                        <VideoCallUI chatClient={chatClient} channel={channel} />
                      </StreamCall>
                    </StreamVideo>
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </main>
      <dialog id="solution_modal" className="modal">
        <div className="modal-box w-11/12 max-w-3xl">
          <h3 className="font-bold text-lg mb-4 text-success">Official Solution ({selectedLanguage})</h3>
          <div className="bg-base-300 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm font-mono text-base-content whitespace-pre-wrap">
              {problemData?.solutionCode?.[selectedLanguage] || "No solution provided for this language."}
            </pre>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default SessionPage;
