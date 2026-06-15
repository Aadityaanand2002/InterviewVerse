import { useParams, useNavigate } from "react-router";
import { useSessionById } from "../hooks/useSessions";
import { useUser } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import { Editor } from "@monaco-editor/react";
import {
  FileCodeIcon, ArrowLeftIcon, CalendarIcon, LockIcon,
  StarIcon, CheckCircleIcon, UserIcon
} from "lucide-react";

const RATING_CONFIG = {
  "Strong Hire":    { color: "text-success border-success bg-success/10", emoji: "💚" },
  "Hire":           { color: "text-info border-info bg-info/10",           emoji: "✅" },
  "No Hire":        { color: "text-error border-error bg-error/10",        emoji: "❌" },
  "Strong No Hire": { color: "text-error border-error bg-error/10",        emoji: "🚫" },
};

function CandidateFeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { data, isLoading } = useSessionById(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-300">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const session = data?.session;

  if (!session) {
    return (
      <div className="min-h-screen bg-base-300 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Session Not Found</h2>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verify this user is the candidate
  const isCandidate =
    session.participant?.clerkId === user?.id ||
    session.candidateEmail === user?.primaryEmailAddress?.emailAddress;

  if (!isCandidate) {
    return (
      <div className="min-h-screen bg-base-300 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-error mb-4">Access Denied</h2>
            <p className="text-base-content/70 mb-4">This feedback is not for you.</p>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ratingConf = session.overallRating ? RATING_CONFIG[session.overallRating] : null;

  return (
    <div className="min-h-screen bg-base-300 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-ghost btn-sm mb-6 gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Interview Feedback</h1>
          <p className="text-base-content/60 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {new Date(session.updatedAt).toLocaleString()} &bull; Interviewer: {session.host?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Info + Score */}
          <div className="space-y-6">
            {/* Session info */}
            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 border-b border-base-200 pb-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  Session Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-base-content/50">Problem</span>
                    <p className="font-semibold">{session.problem}</p>
                  </div>
                  <div>
                    <span className="text-base-content/50">Difficulty</span>
                    <p className="font-semibold capitalize">{session.difficulty}</p>
                  </div>
                  <div>
                    <span className="text-base-content/50">Language Used</span>
                    <p className="font-semibold">{session.finalLanguage || "javascript"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score & Rating — only visible if host shared results */}
            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2 border-b border-base-200 pb-2">
                  <StarIcon className="w-4 h-4 text-warning" />
                  Score & Decision
                </h3>

                {session.sharedWithCandidate ? (
                  <div className="space-y-4">
                    {/* Numeric score */}
                    {session.candidateScore != null ? (
                      <div>
                        <p className="text-sm text-base-content/50 mb-1">Your Score</p>
                        <div className="flex items-end gap-1 mb-2">
                          <span className="text-4xl font-black text-primary">
                            {session.candidateScore}
                          </span>
                          <span className="text-base-content/40 mb-1">/10</span>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                            style={{ width: `${(session.candidateScore / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-base-content/40 italic text-sm">Score not provided</p>
                    )}

                    {/* Overall rating */}
                    {ratingConf ? (
                      <div
                        className={`border rounded-xl p-4 flex items-center gap-3 ${ratingConf.color}`}
                      >
                        <span className="text-2xl">{ratingConf.emoji}</span>
                        <div>
                          <p className="text-xs opacity-70">Overall Decision</p>
                          <p className="font-bold text-lg">{session.overallRating}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base-content/40 italic text-sm">Decision not provided</p>
                    )}

                    <div className="flex items-center gap-2 text-success text-sm">
                      <CheckCircleIcon className="w-4 h-4" />
                      Results shared by interviewer
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <LockIcon className="w-10 h-10 text-base-content/20" />
                    <p className="text-base-content/50 text-sm">
                      The interviewer hasn't shared your results yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Code Editor */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl border border-base-200 h-[600px] flex flex-col overflow-hidden">
              <div className="bg-base-200 px-4 py-3 flex items-center justify-between border-b border-base-300 shrink-0">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileCodeIcon className="w-4 h-4 text-primary" />
                  Your Submitted Code
                </h3>
                <span className="badge badge-outline">
                  {session.finalLanguage || "javascript"}
                </span>
              </div>
              <div className="flex-1 relative">
                {session.finalCode ? (
                  <Editor
                    height="100%"
                    language={session.finalLanguage || "javascript"}
                    theme="vs-dark"
                    value={session.finalCode}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-base-100">
                    <p className="text-base-content/50 italic">No code was submitted.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CandidateFeedbackPage;
