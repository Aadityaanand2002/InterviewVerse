import {
  ArrowRightIcon,
  Code2Icon,
  CrownIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
  LoaderIcon,
  CopyIcon,
  CalendarClock,
} from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { getDifficultyBadgeClass } from "../lib/utils";
import { useUser } from "@clerk/clerk-react";

function ActiveSessions({ sessions, isLoading, isUserInSession }) {
  const { user } = useUser();

  const handleCopyLink = (sessionId) => {
    const url = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(url);
    toast.success("Invite link copied!", {
      style: {
        background: "rgba(16, 185, 129, 0.1)",
        color: "#34d399",
        border: "1px solid rgba(16, 185, 129, 0.2)",
      },
    });
  };

  return (
    <div className="lg:col-span-2 relative glass-card rounded-3xl p-8 h-full flex flex-col overflow-hidden border border-white/10 bg-[#0a0f18]/60 backdrop-blur-xl shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* HEADERS SECTION */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl shadow-lg glow-primary">
            <ZapIcon className="size-5 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-base-content">Live Sessions</h2>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-base-content/5 border border-base-content/10 rounded-full">
          <div className="size-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-base-content">{sessions.length} Active</span>
        </div>
      </div>

      {/* SESSIONS LIST */}
      <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <LoaderIcon className="size-8 animate-spin text-violet-400" />
          </div>
        ) : sessions.length > 0 ? (
          sessions.map((session, i) => (
            <div
              key={session._id}
              className={`group relative p-5 rounded-2xl animate-slide-up overflow-hidden border transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]`}
              style={{
                animationDelay: `${i * 0.1}s`,
                borderColor: session.status === "scheduled" ? "rgba(245, 158, 11, 0.4)" : "rgba(16, 185, 129, 0.4)",
                background: session.status === "scheduled" ? "rgba(245, 158, 11, 0.05)" : "rgba(16, 185, 129, 0.05)",
              }}
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
                {/* LEFT SIDE */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="relative shrink-0 size-14 rounded-2xl bg-base-200 border border-white/5 flex items-center justify-center shadow-inner">
                    <Code2Icon className="size-6 text-base-content/60" />
                    <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-base-100 ${session.status === "scheduled" ? "bg-amber-400" : "bg-emerald-400"}`} />
                  </div>

                  <div className="flex-1 min-w-0 pr-16 md:pr-0">
                      <div className="flex items-center gap-3 mt-1">
                        <h3 className="font-bold text-lg text-base-content truncate">
                          {(() => {
                            const isHost = session.host?.clerkId === user?.id;
                            if (isHost) {
                              return `Interview with ${session.candidateName || "Candidate"}`;
                            }
                            return `Interview with ${session.host?.name?.split(" ")[0] || "Interviewer"}`;
                          })()}
                        </h3>
                        {session.status === "scheduled" ? (
                          <div className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                            <CalendarClock className="w-3 h-3" />
                            Scheduled
                          </div>
                        ) : (
                          <div className="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Active
                          </div>
                        )}
                      </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium mt-3">
                      <div className="flex items-center gap-1.5 text-base-content/70">
                        <CrownIcon className="size-3.5 text-violet-400" />
                        {session.host?.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-base-content/70">
                        <UsersIcon className="size-3.5" />
                        {1 + (session.participants?.length || (session.participant ? 1 : 0))}/{session.maxParticipants === 99 ? '∞' : (session.maxParticipants || 2)}
                      </div>
                      {session.scheduledAt && (
                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <CalendarClock className="size-3.5" />
                          {new Date(session.scheduledAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </div>
                      )}
                      {((session.participants?.length || 0) + 1 >= (session.maxParticipants || 2)) && !isUserInSession(session) ? (
                        <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 uppercase tracking-wider text-[10px]">Full</span>
                      ) : (
                        <span className="text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 uppercase tracking-wider text-[10px]">Open</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="w-full md:w-auto flex justify-end gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-none">
                  {((session.participants?.length || 0) + 1 >= (session.maxParticipants || 2)) && !isUserInSession(session) ? (
                    <button className="px-4 py-2 rounded-xl bg-base-300 text-base-content/40 text-sm font-bold cursor-not-allowed w-full md:w-auto">
                      Session Full
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleCopyLink(session._id)}
                        className="px-3 py-2 rounded-xl bg-base-content/5 hover:bg-base-content/10 border border-base-content/10 text-base-content transition-colors flex items-center justify-center shrink-0"
                        title="Copy Invite Link"
                      >
                        <CopyIcon className="size-4" />
                      </button>
                      <div className="relative group/btn flex-1 md:flex-none">
                        <div className={`absolute -inset-1 rounded-xl blur opacity-30 group-hover/btn:opacity-60 transition duration-300 pointer-events-none ${session.status === "scheduled" ? "bg-gradient-to-r from-violet-500 to-cyan-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`} />
                        <Link 
                          to={`/session/${session._id}`} 
                          className={`relative flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-white text-sm font-bold shine-on-hover shadow-lg w-full ${session.status === "scheduled" ? "bg-gradient-to-r from-violet-500 to-cyan-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
                        >
                          {isUserInSession(session) ? "Rejoin" : "Join"}
                          <ArrowRightIcon className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-base-content/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="size-20 mb-6 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)] animate-float-pulse">
              <SparklesIcon className="size-10 text-violet-400" />
            </div>
            <p className="text-xl font-bold text-base-content mb-2 tracking-tight">No active sessions</p>
            <p className="text-sm text-base-content/50 max-w-xs leading-relaxed">Create a new session to start interviewing or pair programming.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveSessions;
