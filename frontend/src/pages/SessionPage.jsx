import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  useEndSession, 
  useJoinSession, 
  useSessionById, 
  useUpdateSessionProblem, 
  useUpdateSessionNotes,
  useAskToJoin,
  useAdmitParticipant,
  useDenyParticipant
} from "../hooks/useSessions";
import { useProblems } from "../hooks/useProblems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon, CopyIcon, MaximizeIcon } from "lucide-react";
import toast from "react-hot-toast";
import OutputPanel from "../components/OutputPanel";
import ProblemDescription from "../components/ProblemDescription";

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

  const askToJoinMutation = useAskToJoin();
  const admitParticipantMutation = useAdmitParticipant();
  const denyParticipantMutation = useDenyParticipant();

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

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

  // Update notes state when session loads for the first time
  useEffect(() => {
    if (session?.evaluationNotes && !notes) {
      setNotes(session.evaluationNotes);
    }
  }, [session?.evaluationNotes]);

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
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      {/* ADMIT PARTICIPANT BANNER FOR HOST */}
      {isHost && session?.waitingParticipant && (
        <div className="bg-warning/20 border-b border-warning/50 p-3 flex items-center justify-between px-6 z-50">
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

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - CODE EDITOR & PROBLEM DETAILS */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* PROBLEM DSC PANEL */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full overflow-y-auto bg-base-200">
                  {/* HEADER SECTION */}
                  <div className="p-6 bg-base-100 border-b border-base-300">
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
                          <h1 className="text-3xl font-bold text-base-content">
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

                      <div className="flex items-center gap-3">
                        <span
                          className={`badge badge-lg ${getDifficultyBadgeClass(
                            session?.difficulty
                          )}`}
                        >
                          {session?.difficulty.slice(0, 1).toUpperCase() +
                            session?.difficulty.slice(1) || "Easy"}
                        </span>
                        {isHost && session?.status === "active" && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.href);
                              toast.success("Invite link copied!");
                            }}
                            className="btn btn-outline btn-sm gap-2"
                          >
                            <CopyIcon className="w-4 h-4" />
                            Copy Link
                          </button>
                        )}
                        {isHost && session?.status === "active" && (
                          <button
                            onClick={handleEndSession}
                            disabled={endSessionMutation.isPending}
                            className="btn btn-error btn-sm gap-2"
                          >
                            {endSessionMutation.isPending ? (
                              <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                              <LogOutIcon className="w-4 h-4" />
                            )}
                            End Session
                          </button>
                        )}
                        {session?.status === "completed" && (
                          <span className="badge badge-ghost badge-lg">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-0 space-y-0 h-full flex flex-col">
                    <div className="flex-1 overflow-hidden">
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

                    {/* EVALUATION NOTES (HOST ONLY) */}
                    {isHost && (
                      <div className="bg-base-100 p-5 border-t border-primary/20 shrink-0">
                        <h2 className="text-xl font-bold mb-4 text-primary flex items-center gap-2">
                          📝 Private Evaluation Notes
                        </h2>
                        <textarea
                          className="textarea textarea-bordered w-full h-32 mb-3"
                          placeholder="Write your private notes about the candidate here. These will not be visible to the candidate."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={handleSaveNotes}
                          disabled={updateSessionNotesMutation.isPending}
                        >
                          {updateSessionNotesMutation.isPending ? "Saving..." : "Save Notes"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={50} minSize={20}>
                <div id="left-panel-content" className="flex flex-col h-full w-full bg-base-100">
                  {/* MODE TOGGLE */}
                  <div className="flex items-center justify-between p-2 bg-base-200 border-b border-base-300 shrink-0">
                    <div className="flex items-center gap-2">
                      <button 
                        className={`btn btn-sm ${activeTab === "code" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setActiveTab("code")}
                      >
                        Code Editor
                      </button>
                      <button 
                        className={`btn btn-sm ${activeTab === "whiteboard" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setActiveTab("whiteboard")}
                      >
                        Whiteboard
                      </button>
                    </div>
                    <button 
                      className="btn btn-sm btn-ghost btn-square" 
                      onClick={handleFullscreen}
                      title="Toggle Fullscreen"
                    >
                      <MaximizeIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 relative w-full">
                    {activeTab === "code" ? (
                      <PanelGroup direction="vertical">
                        <Panel defaultSize={70} minSize={30}>
                          <CodeEditorPanel
                            selectedLanguage={selectedLanguage}
                            code={code}
                            isRunning={isRunning}
                            onLanguageChange={handleLanguageChange}
                            onCodeChange={(value) => setCode(value)}
                            onRunCode={handleRunCode}
                            onCheatAlert={handleCheatAlert}
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
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4 overflow-auto">
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
    </div>
  );
}

export default SessionPage;
