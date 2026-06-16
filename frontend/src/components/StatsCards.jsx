import { TrophyIcon, UsersIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-5">
      {/* Active Count */}
      <div className="group glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
          <UsersIcon className="size-32" />
        </div>
        <div className="absolute -inset-24 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-[0.07] blur-3xl transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="size-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-shadow duration-500">
              <UsersIcon className="size-6 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-medium text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
              <div className="size-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              Live Now
            </div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight stat-number drop-shadow-sm">
              {activeSessionsCount}
            </div>
            <div className="text-sm font-medium text-base-content/60 uppercase tracking-wider">
              Active Sessions
            </div>
          </div>
        </div>
      </div>

      {/* Recent Count */}
      <div className="group glass-card rounded-3xl p-6 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
          <TrophyIcon className="size-32" />
        </div>
        <div className="absolute -inset-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-[0.07] blur-3xl transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="size-12 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-shadow duration-500">
              <TrophyIcon className="size-6 text-violet-400" />
            </div>
          </div>
          <div>
            <div className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 tracking-tight stat-number drop-shadow-sm">
              {recentSessionsCount}
            </div>
            <div className="text-sm font-medium text-base-content/60 uppercase tracking-wider">
              Total Sessions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
