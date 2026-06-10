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
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, PhoneOffIcon, CopyIcon } from "lucide-react";
import toast from "react-hot-toast";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import MeetingSetup from "../components/MeetingSetup";

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

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

  // find the problem data based on session problem title
  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
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

  const handleSaveNotes = () => {
    updateSessionNotesMutation.mutate({ id, data: { evaluationNotes: notes } });
  };

  const handleProblemChange = (e) => {
    const newProblemTitle = e.target.value;
    const newProblemData = Object.values(PROBLEMS).find((p) => p.title === newProblemTitle);
    
    if (newProblemData) {
      updateSessionProblemMutation.mutate({ 
        id, 
        data: { problem: newProblemTitle, difficulty: newProblemData.difficulty.toLowerCase() }
      });
    }
  };

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

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

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
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
                            className="select select-bordered select-sm font-bold text-lg w-full max-w-xs mb-2"
                            value={session?.problem}
                            onChange={handleProblemChange}
                            disabled={updateSessionProblemMutation.isPending}
                          >
                            {Object.values(PROBLEMS).map(p => (
                              <option key={p.id} value={p.title}>{p.title}</option>
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

                  <div className="p-6 space-y-6">
                    {/* problem desc */}
                    {problemData?.description && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">Description</h2>
                        <div className="space-y-3 text-base leading-relaxed">
                          <p className="text-base-content/90">{problemData.description.text}</p>
                          {problemData.description.notes?.map((note, idx) => (
                            <p key={idx} className="text-base-content/90">
                              {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* examples section */}
                    {problemData?.examples && problemData.examples.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>

                        <div className="space-y-4">
                          {problemData.examples.map((example, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-sm">{idx + 1}</span>
                                <p className="font-semibold text-base-content">Example {idx + 1}</p>
                              </div>
                              <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                                <div className="flex gap-2">
                                  <span className="text-primary font-bold min-w-[70px]">
                                    Input:
                                  </span>
                                  <span>{example.input}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-secondary font-bold min-w-[70px]">
                                    Output:
                                  </span>
                                  <span>{example.output}</span>
                                </div>
                                {example.explanation && (
                                  <div className="pt-2 border-t border-base-300 mt-2">
                                    <span className="text-base-content/60 font-sans text-xs">
                                      <span className="font-semibold">Explanation:</span>{" "}
                                      {example.explanation}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* HIDDEN TEST CASES (HOST ONLY) */}
                    {isHost && problemData?.hiddenTestCases && problemData.hiddenTestCases.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-error/20">
                        <h2 className="text-xl font-bold mb-4 text-error flex items-center gap-2">
                          🔒 Hidden Test Cases (Interviewer Only)
                        </h2>

                        <div className="space-y-4">
                          {problemData.hiddenTestCases.map((example, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-error badge-sm text-error-content">{idx + 1}</span>
                                <p className="font-semibold text-base-content">Edge Case {idx + 1}</p>
                              </div>
                              <div className="bg-error/5 rounded-lg p-4 font-mono text-sm space-y-1.5 border border-error/10">
                                <div className="flex gap-2">
                                  <span className="text-primary font-bold min-w-[70px]">Input:</span>
                                  <span>{example.input}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-secondary font-bold min-w-[70px]">Output:</span>
                                  <span>{example.output}</span>
                                </div>
                                {example.explanation && (
                                  <div className="pt-2 border-t border-error/10 mt-2">
                                    <span className="text-base-content/60 font-sans text-xs">
                                      <span className="font-semibold">Explanation:</span> {example.explanation}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Constraints */}
                    {problemData?.constraints && problemData.constraints.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
                        <ul className="space-y-2 text-base-content/90">
                          {problemData.constraints.map((constraint, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-primary">•</span>
                              <code className="text-sm">{constraint}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* EVALUATION NOTES (HOST ONLY) */}
                    {isHost && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-primary/20">
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
                <PanelGroup direction="vertical">
                  <Panel defaultSize={70} minSize={30}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={(value) => setCode(value)}
                      onRunCode={handleRunCode}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                  <Panel defaultSize={30} minSize={15}>
                    <OutputPanel output={output} />
                  </Panel>
                </PanelGroup>
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
