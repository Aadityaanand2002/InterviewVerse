import { useUser } from "@clerk/clerk-react";
import { ArrowRightIcon, SparklesIcon, PlusIcon, LinkIcon } from "lucide-react";
import Welcome3DBackground from "./Welcome3DBackground";
import { useState } from "react";
import { useNavigate } from "react-router";

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [joinLink, setJoinLink] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinLink.trim()) return;
    
    // Extract ID from URL if they pasted a full link, or just use the ID
    const idMatch = joinLink.match(/session\/([a-zA-Z0-9_-]+)/);
    const sessionId = idMatch ? idMatch[1] : joinLink.trim();
    
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="relative mb-10 group">
      {/* Outer Glowing Aura (Removed to keep it clean like Landing Page) */}
      
      <div className="relative glass-card rounded-3xl p-8 md:p-12 overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-shadow duration-500">
        {/* Deep background gradients */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none animate-float-pulse hide-in-light" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full pointer-events-none animate-float-pulse-delayed hide-in-light" />

        {/* 3D Animated Background */}
        <div className="absolute inset-0 welcome-3d-wrapper">
          <Welcome3DBackground />
        </div>

        {/* Dark Scrim Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-base-100/90 via-base-100/50 to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="animate-slide-up flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-content/5 border border-base-content/10 text-xs font-medium text-base-content/70 mb-4 shadow-sm">
              <SparklesIcon className="size-3.5 text-violet-400" />
              Your Personal Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight text-base-content drop-shadow-md">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-lg">{user?.firstName || "there"}</span> 👋
            </h1>
            <p className="text-lg text-base-content/70 max-w-xl drop-shadow-sm font-medium">
              Ready to conduct your next technical interview? Create a live session, invite your candidate, and start coding in seconds.
            </p>
          </div>

          <div className="shrink-0 animate-slide-up flex flex-col gap-3 w-full md:w-auto md:min-w-[320px]" style={{ animationDelay: "0.1s" }}>
            <button
              onClick={onCreateSession}
              className="relative group flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base-content border border-base-content/10 bg-transparent transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] overflow-hidden w-full"
            >
              {/* Radiance Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex items-center gap-2.5 group-hover:text-cyan-400 transition-colors duration-300">
                <div className="p-1.5 rounded-lg border border-base-content/10 group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10 transition-colors duration-300">
                  <PlusIcon className="size-5" />
                </div>
                Create New Session
                <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
            
            <form onSubmit={handleJoin} className="relative group/join w-full">
               <div className="absolute inset-0 bg-base-content/5 rounded-2xl blur-md group-hover/join:bg-base-content/10 transition-colors pointer-events-none" />
               <div className="relative flex items-center bg-base-200/50 backdrop-blur-md border border-base-content/10 rounded-2xl p-1.5 shadow-inner transition-colors focus-within:border-primary/50 focus-within:bg-base-100">
                 <div className="pl-3 pr-2 text-base-content/50">
                   <LinkIcon className="size-4" />
                 </div>
                 <input
                   type="text"
                   value={joinLink}
                   onChange={(e) => setJoinLink(e.target.value)}
                   placeholder="Paste invite link or ID..."
                   className="bg-transparent border-none outline-none text-sm text-base-content font-medium w-full pr-2 placeholder:text-base-content/50"
                 />
                 <button 
                   type="submit"
                   disabled={!joinLink.trim()}
                   className="px-4 py-2 bg-primary/10 hover:bg-primary/20 disabled:opacity-50 disabled:hover:bg-primary/10 text-primary text-sm font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1"
                 >
                   Join
                 </button>
               </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
