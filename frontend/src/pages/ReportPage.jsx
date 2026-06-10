import { useParams, useNavigate } from "react-router";
import { useSessionById } from "../hooks/useSessions";
import { useUser } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import { Editor } from "@monaco-editor/react";
import { FileCodeIcon, NotebookPenIcon, UserIcon, ArrowLeftIcon, CalendarIcon } from "lucide-react";

function ReportPage() {
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
            <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only the host should see this page
  const isHost = session.host?._id === user?.id || session.host?.clerkId === user?.id;

  if (!isHost) {
    return (
      <div className="min-h-screen bg-base-300 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-error mb-4">Access Denied</h2>
            <p className="text-base-content/70 mb-4">Only the host can view the interview report.</p>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-300 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        <button 
          onClick={() => navigate("/dashboard")}
          className="btn btn-ghost btn-sm mb-6 gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              Post-Interview Report
              <div className="badge badge-primary">Completed</div>
            </h1>
            <p className="text-base-content/60 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {new Date(session.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COL: DETAILS & NOTES */}
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-base-200 pb-2">
                  <UserIcon className="w-5 h-5 text-primary" />
                  Candidate Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-base-content/60">Name</label>
                    <p className="font-semibold text-lg">{session.candidateName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-base-content/60">Email</label>
                    <p className="font-semibold">{session.candidateEmail}</p>
                  </div>
                  {session.participant && (
                    <div className="mt-4 flex items-center gap-3 bg-base-200 p-3 rounded-lg">
                      <img 
                        src={session.participant.profileImage} 
                        className="w-10 h-10 rounded-full"
                        alt=""
                      />
                      <div>
                        <p className="text-sm font-medium">Joined Profile</p>
                        <p className="text-xs text-base-content/60">{session.participant.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-base-200 pb-2">
                  <NotebookPenIcon className="w-5 h-5 text-primary" />
                  Evaluation Notes
                </h3>
                {session.evaluationNotes ? (
                  <div className="prose prose-invert max-w-none text-base-content">
                    <p className="whitespace-pre-wrap">{session.evaluationNotes}</p>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-base-200 rounded-lg">
                    <p className="text-base-content/50 italic">No notes were taken during this session.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COL: PROBLEM & FINAL CODE */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-base-100 shadow-xl border border-base-200">
              <div className="card-body p-6">
                <div className="flex justify-between items-start border-b border-base-200 pb-2 mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FileCodeIcon className="w-5 h-5 text-primary" />
                    Problem Details
                  </h3>
                  <div className={`badge ${
                      session.difficulty === "easy" ? "badge-success" :
                      session.difficulty === "medium" ? "badge-warning" : "badge-error"
                    }`}>
                    {session.difficulty}
                  </div>
                </div>
                <h4 className="font-semibold text-lg">{session.problem}</h4>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-200 flex-1 h-[600px] flex flex-col overflow-hidden">
              <div className="bg-base-200 px-4 py-3 flex items-center justify-between border-b border-base-300 shrink-0">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileCodeIcon className="w-4 h-4 text-primary" />
                  Final Submitted Code
                </h3>
                <span className="badge badge-outline">{session.finalLanguage || "javascript"}</span>
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
                      wordWrap: "on"
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-base-100">
                    <p className="text-base-content/50 italic">No code was written.</p>
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

export default ReportPage;
