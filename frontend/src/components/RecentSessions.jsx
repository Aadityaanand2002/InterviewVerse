import { Code2, Clock, Users, Trophy, Loader, ChevronRightIcon, BarChart2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router";

function RecentSessions({ sessions, isLoading }) {
  const { user } = useUser();
  
  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl shadow-lg glow-secondary">
          <Clock className="size-5 text-white" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-base-content">Past Sessions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-24 glass-card rounded-3xl">
            <Loader className="w-10 h-10 animate-spin text-cyan-400" />
          </div>
        ) : sessions.length > 0 ? (
          sessions.map((session, i) => {
            const isHost = session.host?.clerkId === user?.id;
            const linkTo = isHost
              ? `/report/${session._id}`
              : `/feedback/${session._id}`;
              
            return (
              <Link
                key={session._id}
                to={linkTo}
                className="group relative p-6 rounded-3xl overflow-hidden glass-card hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] block animate-slide-up"
                style={{ animationDelay: `${(i % 10) * 0.05}s` }}
              >
                {/* Background ambient glow on hover */}
                <div className="absolute -inset-24 bg-gradient-to-br from-cyan-500 to-violet-500 opacity-0 group-hover:opacity-[0.05] blur-3xl transition-opacity duration-500 pointer-events-none" />

                {/* Status indicator top glow */}
                {session.status === "active" ? (
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-base-content/20 to-base-content/10 opacity-50 group-hover:opacity-100 transition-opacity" />
                )}

                {session.status === "active" && (
                  <div className="absolute top-4 right-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Active
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 mb-6 mt-2">
                  <div
                    className={`shrink-0 size-12 rounded-xl flex items-center justify-center shadow-inner border border-white/10 transition-colors duration-300 ${
                      session.status === "active"
                        ? "bg-gradient-to-br from-emerald-400 to-cyan-400"
                        : "bg-primary/10 group-hover:bg-primary/20 border-primary/20 group-hover:border-primary/40 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    }`}
                  >
                    <Code2 className={`size-6 ${session.status === "active" ? "text-white" : "text-primary/70 group-hover:text-primary transition-colors duration-300"}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-bold text-base text-base-content truncate group-hover:text-cyan-400 transition-colors mt-2">
                      {(() => {
                        if (isHost) {
                          return `Interview with ${session.candidateName || "Candidate"}`;
                        }
                        return `Interview with ${session.host?.name?.split(" ")[0] || "Interviewer"}`;
                      })()}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-base-content/60 mb-6 bg-base-content/5 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    <span className="truncate">
                      {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="w-px h-3 bg-base-content/20" />
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    <span>{1 + (session.participants?.length || (session.participant ? 1 : 0))} / {session.maxParticipants === 99 ? '∞' : (session.maxParticipants || 2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider mb-0.5">Updated</span>
                    <span className="text-xs font-medium opacity-80 text-base-content">
                      {new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Feedback available badge for candidates */}
                    {!isHost && session.sharedWithCandidate && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        <BarChart2Icon className="size-3" />
                        Feedback
                      </div>
                    )}
                    
                    <div className="size-8 rounded-full bg-base-content/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                      <ChevronRightIcon className="size-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-24 glass-card rounded-3xl border-dashed border-2 border-base-content/10">
            <div className="size-20 mx-auto mb-6 bg-base-200 border border-white/5 rounded-full flex items-center justify-center shadow-inner">
              <Trophy className="size-10 text-base-content/30" />
            </div>
            <p className="text-xl font-bold text-base-content mb-2">No history yet</p>
            <p className="text-base-content/50 max-w-sm mx-auto">Your completed interviews and practice sessions will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentSessions;
