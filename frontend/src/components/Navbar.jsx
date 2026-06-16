import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SparklesIcon, ShieldIcon, BrainCircuitIcon } from "lucide-react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { ThemeToggle } from "./ThemeToggle";

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
          {/* Logo Image */}
          <svg viewBox="0 0 120 120" fill="none" className="h-10 md:h-11 w-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
            <defs>
              <filter id="cyanGlowNav" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#cyanGlowNav)">
              <path d="M25 25 h 16 v 70 h -16 z" className="stroke-base-content" strokeWidth="4" strokeLinejoin="round" />
              <path d="M33 33 v 54" className="stroke-base-content" strokeWidth="4" strokeLinecap="round" />
              <path d="M50 25 L 75 85 L 100 25" className="stroke-base-content" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M62 25 L 75 60 L 88 25" className="stroke-base-content" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </svg>
          
          {/* Ultra-Premium Wordmark */}
          <div className="flex items-baseline" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <span className="text-2xl font-black text-base-content tracking-tight drop-shadow-sm">
              Interview
            </span>
            <span className="text-2xl font-bold text-primary tracking-wide drop-shadow-sm">
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

          <div className="ml-3 pl-3 border-l border-white/10 flex items-center gap-3">
            <ThemeToggle />
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
