import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon, ShieldIcon, BrainCircuitIcon } from "lucide-react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { useCurrentUser } from "../hooks/useCurrentUser";

function Navbar() {
  const location = useLocation();
  const { user } = useUser();
  const { data: currentUser } = useCurrentUser();

  const isActive = (path) => location.pathname === path;
  const isAdmin = currentUser?.role === "admin";

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 group"
        >
          {/* Premium Logo Container */}
          <div className="relative size-11 rounded-2xl bg-gradient-to-br from-[#0a0f18] to-[#121827] border border-white/10 flex items-center justify-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_8px_16px_rgba(0,0,0,0.6)] overflow-hidden group-hover:scale-105 transition-transform duration-300">
            {/* Background glowing orb */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 group-hover:from-violet-500/40 group-hover:to-cyan-500/40 transition-colors duration-500 blur-md" />
            
            {/* Abstract Geometric 'IV' Vector Logo */}
            <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 p-2 drop-shadow-[0_2px_8px_rgba(139,92,246,0.8)]" fill="none" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="logo-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop stopColor="#c084fc" offset="0%" />
                  <stop stopColor="#22d3ee" offset="100%" />
                </linearGradient>
              </defs>
              {/* I - Letter */}
              <path d="M28 20 v60" stroke="url(#logo-grad-main)" />
              {/* V - Letter */}
              <path d="M48 20 l14 60 l14 -60" stroke="url(#logo-grad-main)" />
            </svg>
          </div>
          
          {/* Ultra-Premium Wordmark */}
          <div className="flex items-baseline" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 drop-shadow-sm">
              Interview
            </span>
            <span className="text-2xl font-light text-gray-100 tracking-wider">
              Verse
            </span>
          </div>
        </Link>

        {/* NAV LINKS */}
        <div className="flex items-center gap-1">
          <Link
            to="/problems"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive("/problems")
                ? "bg-violet-500/15 text-violet-400 border border-violet-500/25"
                : "text-base-content/55 hover:text-base-content hover:bg-base-content/5"
            }`}
          >
            <BookOpenIcon className="size-4" />
            <span className="hidden sm:inline">Problems</span>
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive("/dashboard")
                ? "bg-violet-500/15 text-violet-400 border border-violet-500/25"
                : "text-base-content/55 hover:text-base-content hover:bg-base-content/5"
            }`}
          >
            <LayoutDashboardIcon className="size-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/problems"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive("/admin/problems")
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/25"
                  : "text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/5"
              }`}
            >
              <ShieldIcon className="size-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <div className="ml-3 pl-3 border-l border-white/10">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8 ring-2 ring-violet-500/30 hover:ring-violet-500/60 transition-all",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
