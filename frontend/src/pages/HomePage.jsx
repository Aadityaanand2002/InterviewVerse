import { useState, useEffect } from "react";
import { SignInButton } from "@clerk/clerk-react";
import axiosInstance from "../lib/axios";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  ArrowRightIcon,
  Code2Icon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
  ShieldCheckIcon,
  BrainCircuitIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  StarIcon,
  ChevronRightIcon,
  TwitterIcon,
  GithubIcon,
  LinkedinIcon,
  ClockIcon
} from "lucide-react";

const features = [
  {
    icon: VideoIcon,
    title: "HD Video Calls",
    description: "Crystal-clear video with ultra-low latency powered by Stream.io. See every facial cue during interviews.",
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.3)",
  },
  {
    icon: Code2Icon,
    title: "Live Code Editor",
    description: "Monaco editor with real-time collaboration. Multi-language support with syntax highlighting and auto-complete.",
    gradient: "from-cyan-500 to-blue-600",
    glow: "rgba(6,182,212,0.3)",
    className: "col-span-1 md:col-span-2 lg:col-span-2",
    mockup: (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] max-w-[320px] bg-[#0d1117] rounded-l-xl border-y border-l border-white/10 shadow-2xl overflow-hidden hidden md:block group-hover:-translate-x-2 transition-transform duration-500">
        <div className="h-6 border-b border-white/5 bg-[#161b22] flex items-center px-3 gap-1.5">
          <div className="size-2 rounded-full bg-red-500/80"></div>
          <div className="size-2 rounded-full bg-yellow-500/80"></div>
          <div className="size-2 rounded-full bg-green-500/80"></div>
        </div>
        <div className="p-4 font-mono text-[10px] text-white/50 leading-relaxed">
          <span className="text-purple-400">function</span> <span className="text-blue-400">twoSum</span>(nums, target) {'{\n'}
          {'  '}const map = <span className="text-purple-400">new</span> <span className="text-yellow-400">Map</span>();{'\n'}
          {'  '}<span className="text-purple-400">for</span> (let i = <span className="text-orange-400">0</span>; i {'<'} nums.length; i++) {'{\n'}
          {'    '}const comp = target - nums[i];{'\n'}
          {'    '}<span className="text-purple-400">if</span> (map.<span className="text-blue-400">has</span>(comp)) {'{\n'}
          {'      '}<span className="text-purple-400">return</span> [map.<span className="text-blue-400">get</span>(comp), i];{'\n'}
          {'    }\n'}
          {'    '}map.<span className="text-blue-400">set</span>(nums[i], i);{'\n'}
          {'  }\n'}
          {'}'}
        </div>
      </div>
    )
  },
  {
    icon: BrainCircuitIcon,
    title: "Smart Whiteboard",
    description: "Collaborative infinite canvas powered by tldraw. Sketch algorithms, draw diagrams together in real-time.",
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.3)",
  },
  {
    icon: ShieldCheckIcon,
    title: "Anti-Cheat System",
    description: "Automatic paste detection, focus tracking, and session integrity monitoring for fair interviews.",
    gradient: "from-orange-500 to-red-600",
    glow: "rgba(249,115,22,0.3)",
  },
  {
    icon: TrendingUpIcon,
    title: "Score & Analytics",
    description: "Rate candidates with 1-10 scores, hiring decisions, and private evaluation notes. Share results instantly.",
    gradient: "from-pink-500 to-rose-600",
    glow: "rgba(236,72,153,0.3)",
  },
  {
    icon: UsersIcon,
    title: "Candidate Feedback",
    description: "Give candidates access to their submitted code and your evaluation after the interview ends.",
    gradient: "from-amber-500 to-yellow-600",
    glow: "rgba(245,158,11,0.3)",
    className: "col-span-1 md:col-span-2 lg:col-span-2",
    mockup: (
      <div className="absolute right-0 bottom-0 w-[45%] max-w-[280px] bg-[#0a0f18]/80 backdrop-blur-xl rounded-tl-2xl border-t border-l border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] p-5 hidden md:flex flex-col gap-4 group-hover:-translate-x-1 transition-transform duration-500">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-base-content/50 uppercase font-bold tracking-wider">Overall Score</span>
          <span className="text-xl font-black text-emerald-400">9.5<span className="text-xs font-medium text-base-content/30">/10</span></span>
        </div>
        <div className="space-y-3 mt-2">
          <div>
            <div className="flex justify-between text-[10px] text-base-content/60 mb-1.5 font-medium"><span>Logic</span><span>9/10</span></div>
            <div className="w-full bg-black/40 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full w-[90%] shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div></div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-base-content/60 mb-1.5 font-medium"><span>Code Quality</span><span>10/10</span></div>
            <div className="w-full bg-black/40 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full w-[100%] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div></div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-base-content/60 mb-1.5 font-medium"><span>Communication</span><span>9.5/10</span></div>
            <div className="w-full bg-black/40 rounded-full h-1.5"><div className="bg-violet-500 h-1.5 rounded-full w-[95%] shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div></div>
          </div>
        </div>
        <div className="mt-auto pt-3 border-t border-white/5 flex gap-2 items-center">
          <div className="size-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"><CheckCircleIcon className="size-3.5 text-white"/></div>
          <span className="text-sm font-bold text-white tracking-wide">Strong Hire</span>
        </div>
      </div>
    )
  },
  {
    icon: ClockIcon,
    title: "Session History",
    description: "Access past interview sessions, complete code snapshots, and activity timelines instantly.",
    gradient: "from-indigo-500 to-blue-600",
    glow: "rgba(99,102,241,0.3)",
  },
];

const testimonials = [
  { name: "Arjun Sharma", role: "Engineering Manager @ Flipkart", stars: 5, text: "InterviewVerse completely changed how we conduct technical interviews. The live code editor + video is seamless." },
  { name: "Priya Nair", role: "Senior SDE @ Google", stars: 5, text: "Best platform I've used as a candidate. Getting real-time feedback with my actual code was incredibly helpful." },
  { name: "Rohit Jain", role: "Tech Lead @ Razorpay", stars: 5, text: "The whiteboard + anti-cheat features make it a complete package. Our hiring quality has improved 3x." },
];

const stats = [
  { value: "10K+", label: "Active Users", icon: UsersIcon },
  { value: "50K+", label: "Sessions Completed", icon: Code2Icon },
  { value: "99.9%", label: "Platform Uptime", icon: ZapIcon },
  { value: "4.9★", label: "Average Rating", icon: StarIcon },
];

const FeatureCard = ({ icon: Icon, title, description, gradient, className = "", mockup, i }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: i * 0.08, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative glass-card rounded-2xl p-6 md:p-8 group overflow-hidden border border-base-content/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)] ${className}`}
    >
      {/* Radiance / Spotlight Effect */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(250px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 80%)`
        }}
      />
      
      {/* Top Border Glow */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-80 transition-opacity duration-500`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="relative mb-5 inline-block z-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-xl opacity-20 group-hover:opacity-50 transition-opacity duration-500`} />
          <div className="relative size-12 rounded-xl flex items-center justify-center bg-base-200/80 border border-base-content/5 shadow-lg backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-20`} />
            <Icon className="size-5 text-base-content relative z-10 drop-shadow-md" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="font-extrabold text-lg md:text-xl mb-3 text-base-content z-10 relative tracking-wide">{title}</h3>
        <p className={`text-base font-semibold text-base-content leading-relaxed z-10 relative ${mockup ? "max-w-[55%] md:max-w-[50%]" : "max-w-[90%]"}`}>{description}</p>
      </div>

      {mockup}
    </motion.div>
  );
};

function HomePage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["Technical Interviews", "Collaborative Coding", "Remote Hiring", "Pair Programming"];
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const [demoCode, setDemoCode] = useState(`// Write some code to try out the editor!\n\nfunction findTwoSum(nums, target) {\n  const numMap = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (numMap.has(complement)) {\n      return [numMap.get(complement), i];\n    }\n    numMap.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log("Result:", findTwoSum([2, 7, 11, 15], 9));`);
  const [demoOutput, setDemoOutput] = useState("");
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("idle");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    setSubscribeStatus("loading");
    
    try {
      await axiosInstance.post("/subscribers/subscribe", { email: subscribeEmail });
      setSubscribeStatus("success");
      setSubscribeEmail("");
      setTimeout(() => setSubscribeStatus("idle"), 3000);
    } catch (error) {
      console.error("Subscription failed:", error);
      alert(error.response?.data?.message || "Failed to subscribe. Please try again.");
      setSubscribeStatus("idle");
    }
  };

  const runDemoCode = () => {
    setIsDemoRunning(true);
    setDemoOutput("Running...");
    
    setTimeout(() => {
      let logs = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };
      
      try {
        new Function(demoCode)();
        setDemoOutput(logs.join('\n') || "Code executed successfully with no output.");
      } catch (err) {
        setDemoOutput(err.toString());
      } finally {
        console.log = originalConsoleLog;
        setIsDemoRunning(false);
      }
    }, 400);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen hero-bg overflow-x-hidden relative">
      {/* Grid overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30 z-0" />

      {/* ===== NAVBAR ===== */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <svg viewBox="0 0 120 120" fill="none" className="h-10 md:h-11 w-auto group-hover:scale-105 transition-transform duration-300 drop-shadow-sm text-base-content">
              <defs>
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g filter="url(#cyanGlow)">
                <path d="M25 25 h 16 v 70 h -16 z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
                <path d="M33 33 v 54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <path d="M50 25 L 75 85 L 100 25" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M62 25 L 75 60 L 88 25" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
              </g>
            </svg>
            
            {/* Ultra-Premium Wordmark */}
            <div className="flex items-baseline" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <span className="text-2xl font-black text-base-content tracking-tight drop-shadow-sm">
                Interview
              </span>
              <span className="text-2xl font-bold text-cyan-500 tracking-wide drop-shadow-sm">
                Verse
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-base-content/60">
            <a href="#demo" className="hover:text-base-content transition-colors">Live Demo</a>
            <a href="#features" className="hover:text-base-content transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-base-content transition-colors">Reviews</a>
            <a href="#faq" className="hover:text-base-content transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignInButton mode="modal">
              <button className="text-red-500 hover:text-red-400 bg-transparent hover:bg-red-500/10 flex items-center px-6 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                Login
              </button>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20">

        {/* Background Decorative Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Decorative Floating Elements (Visible on larger screens) */}
        {/* ========================================= */}
        {/* FLOATING CODE BLOCKS (LEFT SIDE) */}
        {/* ========================================= */}

        {/* 1. React / JS Snippet */}
        <div className="hidden lg:block absolute top-28 -left-4 xl:-left-12 animate-float">
          <div className="glass-card p-3 rounded-xl shadow-2xl border-white/5 rotate-[-8deg] hover:rotate-0 transition-transform duration-300 backdrop-blur-md bg-[#0d1117]/80">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <div className="size-2 rounded-full bg-rose-500/80" />
              <div className="size-2 rounded-full bg-amber-500/80" />
              <div className="size-2 rounded-full bg-emerald-500/80" />
              <span className="text-[9px] text-base-content/40 font-mono ml-2">session.js</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed">
              <span className="text-violet-400">const</span> <span className="text-cyan-400">session</span> <span className="text-base-content/60">=</span> <span className="text-emerald-300">useLiveCode()</span><br />
              <span className="text-violet-400">if</span> (session.<span className="text-cyan-400">isJoined</span>) {'{'}<br />
              &nbsp;&nbsp;<span className="text-emerald-300">startInterview</span>()<br />
              {'}'}
            </pre>
          </div>
        </div>

        {/* 2. Python Snippet */}
        <div className="hidden lg:block absolute top-64 left-2 xl:-left-4 animate-float" style={{ animationDelay: '1.2s' }}>
          <div className="glass-card p-3 rounded-xl shadow-2xl border-white/5 rotate-[5deg] hover:rotate-0 transition-transform duration-300 backdrop-blur-md bg-[#0d1117]/80">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <div className="size-2 rounded-full bg-rose-500/80" />
              <div className="size-2 rounded-full bg-amber-500/80" />
              <div className="size-2 rounded-full bg-emerald-500/80" />
              <span className="text-[9px] text-base-content/40 font-mono ml-2">algorithm.py</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed">
              <span className="text-violet-400">def</span> <span className="text-cyan-400">twoSum</span>(nums, target):<br />
              &nbsp;&nbsp;seen = {'{}'}<br />
              &nbsp;&nbsp;<span className="text-violet-400">for</span> i, n <span className="text-violet-400">in</span> enumerate(nums):<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-violet-400">if</span> target - n <span className="text-violet-400">in</span> seen:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-violet-400">return</span> [seen[target-n], i]
            </pre>
          </div>
        </div>

        {/* 3. Go Snippet */}
        <div className="hidden lg:block absolute top-96 -left-8 xl:-left-16 animate-float" style={{ animationDelay: '2.4s' }}>
          <div className="glass-card p-3 rounded-xl shadow-2xl border-white/5 rotate-[-4deg] hover:rotate-0 transition-transform duration-300 backdrop-blur-md bg-[#0d1117]/80 opacity-80">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <div className="size-2 rounded-full bg-rose-500/80" />
              <div className="size-2 rounded-full bg-amber-500/80" />
              <div className="size-2 rounded-full bg-emerald-500/80" />
              <span className="text-[9px] text-base-content/40 font-mono ml-2">main.go</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed">
              <span className="text-violet-400">func</span> <span className="text-emerald-300">main</span>() {'{'}<br />
              &nbsp;&nbsp;ch := <span className="text-cyan-400">make</span>(<span className="text-violet-400">chan</span> <span className="text-cyan-400">int</span>)<br />
              &nbsp;&nbsp;<span className="text-violet-400">go</span> worker(ch)<br />
              &nbsp;&nbsp;&lt;-ch<br />
              {'}'}
            </pre>
          </div>
        </div>


        {/* ========================================= */}
        {/* FLOATING CODE BLOCKS (RIGHT SIDE) */}
        {/* ========================================= */}

        {/* 4. C++ Snippet */}
        <div className="hidden lg:block absolute top-24 -right-2 xl:-right-10 animate-float" style={{ animationDelay: '0.8s' }}>
          <div className="glass-card p-3 rounded-xl shadow-2xl border-white/5 rotate-[7deg] hover:rotate-0 transition-transform duration-300 backdrop-blur-md bg-[#0d1117]/80">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <div className="size-2 rounded-full bg-rose-500/80" />
              <div className="size-2 rounded-full bg-amber-500/80" />
              <div className="size-2 rounded-full bg-emerald-500/80" />
              <span className="text-[9px] text-base-content/40 font-mono ml-2">solution.cpp</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed">
              <span className="text-violet-400">int</span> <span className="text-emerald-300">fib</span>(<span className="text-violet-400">int</span> n) {'{'}<br />
              &nbsp;&nbsp;<span className="text-violet-400">if</span> (n &lt;= <span className="text-amber-400">1</span>) <span className="text-violet-400">return</span> n;<br />
              &nbsp;&nbsp;<span className="text-violet-400">return</span> fib(n-<span className="text-amber-400">1</span>) + fib(n-<span className="text-amber-400">2</span>);<br />
              {'}'}
            </pre>
          </div>
        </div>

        {/* 5. Rust Snippet */}
        <div className="hidden lg:block absolute top-60 -right-6 xl:-right-16 animate-float" style={{ animationDelay: '2s' }}>
          <div className="glass-card p-3 rounded-xl shadow-2xl border-white/5 rotate-[-5deg] hover:rotate-0 transition-transform duration-300 backdrop-blur-md bg-[#0d1117]/80 opacity-90">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <div className="size-2 rounded-full bg-rose-500/80" />
              <div className="size-2 rounded-full bg-amber-500/80" />
              <div className="size-2 rounded-full bg-emerald-500/80" />
              <span className="text-[9px] text-base-content/40 font-mono ml-2">lib.rs</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed">
              <span className="text-violet-400">pub fn</span> <span className="text-emerald-300">is_valid</span>(s: String) -&gt; <span className="text-cyan-400">bool</span> {'{'}<br />
              &nbsp;&nbsp;<span className="text-violet-400">let mut</span> stack = Vec::new();<br />
              &nbsp;&nbsp;<span className="text-violet-400">for</span> c <span className="text-violet-400">in</span> s.chars() {'{'}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-base-content/50">// stack logic</span><br />
              &nbsp;&nbsp;{'}'}<br />
              &nbsp;&nbsp;stack.is_empty()<br />
              {'}'}
            </pre>
          </div>
        </div>

        {/* 6. Java Snippet */}
        <div className="hidden lg:block absolute top-[22rem] right-2 xl:-right-8 animate-float" style={{ animationDelay: '1.7s' }}>
          <div className="glass-card p-3 rounded-xl shadow-2xl border-white/5 rotate-[4deg] hover:rotate-0 transition-transform duration-300 backdrop-blur-md bg-[#0d1117]/80 opacity-80">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <div className="size-2 rounded-full bg-rose-500/80" />
              <div className="size-2 rounded-full bg-amber-500/80" />
              <div className="size-2 rounded-full bg-emerald-500/80" />
              <span className="text-[9px] text-base-content/40 font-mono ml-2">Graph.java</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed">
              <span className="text-violet-400">public class</span> <span className="text-cyan-400">Graph</span> {'{'}<br />
              &nbsp;&nbsp;<span className="text-violet-400">private</span> Map&lt;Node, List&gt; adj;<br />
              &nbsp;&nbsp;<span className="text-violet-400">public void</span> <span className="text-emerald-300">bfs</span>(Node start) {'{'}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;Queue&lt;Node&gt; q = <span className="text-violet-400">new</span> LinkedList&lt;&gt;();<br />
              &nbsp;&nbsp;&nbsp;&nbsp;q.add(start);<br />
              &nbsp;&nbsp;{'}'}<br />
              {'}'}
            </pre>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto animate-slide-up relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 text-sm text-violet-400 font-medium mb-8 hover:bg-violet-500/20 transition-colors cursor-pointer">
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            Real-time Collaborative Interviews
            <ChevronRightIcon className="size-3.5" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.08] tracking-tight">
            The Future of
            <br />
            <span key={currentWordIndex} className="gradient-text text-glow animate-fade-in inline-block">
              {words[currentWordIndex]}
            </span>
            <br />
            <span className="text-base-content/80">Starts Here</span>
          </h1>

          <p className="text-xl text-base-content/60 leading-relaxed max-w-2xl mx-auto mb-12 animate-slide-up-1">
            Conduct or ace technical interviews with live video, collaborative code editing,
            AI-ready whiteboards, and instant candidate feedback — all in one platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16 animate-slide-up-2">
            <SignInButton mode="modal">
              <button className="btn-gradient flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white text-base font-semibold shine-on-hover hover:-translate-y-1 transition-all shadow-lg hover:shadow-xl shadow-violet-500/20">
                <ZapIcon className="size-5" />
                Get Started for Free
                <ArrowRightIcon className="size-4" />
              </button>
            </SignInButton>

            <button onClick={() => setIsVideoModalOpen(true)} className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold border border-base-content/10 bg-base-content/5 hover:bg-base-content/10 transition-colors text-base-content/80">
              <VideoIcon className="size-5 text-violet-400" />
              Watch Demo
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-base-content/50 animate-slide-up-3">
            <div className="flex -space-x-2">
              {["bg-violet-500", "bg-cyan-500", "bg-emerald-500", "bg-pink-500"].map((c, i) => (
                <div key={i} className={`size-7 rounded-full border-2 border-base-100 ${c} flex items-center justify-center text-white text-xs font-bold z-${10 - i}`}>
                  {["A", "R", "P", "S"][i]}
                </div>
              ))}
            </div>
            <span>Join <strong className="text-base-content/80">10,000+</strong> engineers already using InterviewVerse</span>
          </div>
        </div>

        {/* Hero visual — code card */}
        <div className="relative mt-20 max-w-4xl mx-auto animate-slide-up-4">
          {/* Glow behind card */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-emerald-500/20 blur-3xl -z-10 scale-110" />

          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-1 bg-base-100/50">
            <img
              src="/hero-mockup.png"
              alt="InterviewVerse Platform"
              className="w-full h-auto rounded-xl shadow-inner border border-white/5"
            />
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              key={i} 
              className="glass-card card-lift rounded-2xl p-6 text-center"
            >
              <Icon className="size-5 text-violet-400 mx-auto mb-3" />
              <div className="text-3xl font-black text-base-content mb-1">{value}</div>
              <div className="text-sm text-base-content/50">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== INTERACTIVE DEMO ===== */}
      <section id="demo" className="relative max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-3 tracking-tight">Try the <span className="gradient-text">Live Editor</span></h2>
          <p className="text-base-content/50">Experience the zero-latency collaborative environment right now.</p>
        </div>
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
           className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-2 bg-[#0d1117] flex flex-col md:flex-row"
        >
          {/* Editor Side */}
          <div className="flex-1 border-r border-white/5">
            <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/5 rounded-tl-xl md:rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-500" />
                <div className="size-3 rounded-full bg-yellow-500" />
                <div className="size-3 rounded-full bg-green-500" />
                <div className="ml-4 text-xs font-mono text-white/50">demo.js</div>
              </div>
              <button 
                onClick={runDemoCode} 
                disabled={isDemoRunning}
                className="btn btn-xs btn-primary bg-emerald-500 hover:bg-emerald-600 text-white border-none gap-1"
              >
                {isDemoRunning ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-white" />
                )}
                Run Code
              </button>
            </div>
            <div className="h-[400px]">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={demoCode}
                onChange={(value) => setDemoCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "JetBrains Mono, monospace",
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  padding: { top: 20 },
                  lineNumbersMinChars: 3,
                  wordWrap: "on"
                }}
              />
            </div>
          </div>
          
          {/* Output Side */}
          <div className="w-full md:w-80 bg-[#0a0a0a] flex flex-col rounded-b-xl md:rounded-bl-none md:rounded-tr-xl">
            <div className="px-4 py-3 bg-[#161b22] border-b border-white/5 md:rounded-tr-xl">
              <div className="text-xs font-mono text-white/50 uppercase tracking-wider">Output Console</div>
            </div>
            <div className="p-4 flex-1 overflow-auto h-[200px] md:h-auto font-mono text-sm">
              {demoOutput ? (
                <pre className={demoOutput.includes("Error") ? "text-red-400 whitespace-pre-wrap" : "text-emerald-400 whitespace-pre-wrap"}>
                  {demoOutput}
                </pre>
              ) : (
                <div className="text-base-content/30 italic">Click 'Run Code' to see the output here...</div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 text-sm text-cyan-400 font-medium mb-6">
            <SparklesIcon className="size-3.5" />
            Everything you need
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Built for{" "}
            <span className="gradient-text">Modern Interviews</span>
          </h2>
          <p className="text-xl font-medium text-base-content/70 max-w-xl mx-auto leading-relaxed">
            Every feature is thoughtfully designed to make technical interviews smoother, fairer, and more insightful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} i={i} />
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black mb-3 tracking-tight">
            Loved by <span className="gradient-text">Engineers</span>
          </h2>
          <p className="text-xl font-medium text-base-content/70">Real feedback from real interviews</p>
        </div>

        <div className="relative flex overflow-hidden group mask-horizontal">
          <div className="flex gap-5 animate-marquee min-w-full hover:[animation-play-state:paused] pr-5">
            {[...testimonials, ...testimonials].map(({ name, role, stars, text }, i) => (
              <div 
                key={i} 
                className="glass-card card-lift rounded-2xl p-6 shrink-0 w-[350px] md:w-[400px] border border-base-content/5 backdrop-blur-md"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array(stars).fill(0).map((_, j) => (
                    <StarIcon key={`star-${i}-${j}`} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-base-content font-semibold text-base md:text-lg leading-relaxed mb-6 line-clamp-4">"{text}"</p>
                <div className="flex items-center gap-4 pt-5 border-t border-base-content/10">
                  <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-base font-bold shadow-lg">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-base font-bold text-base-content tracking-wide">{name}</p>
                    <p className="text-sm font-medium text-cyan-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section id="faq" className="relative max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-3 tracking-tight">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <p className="text-base-content/50">Everything you need to know about the platform.</p>
        </div>
        <div className="space-y-4">
          {[
            { q: "What programming languages are supported?", a: "We support over 40+ programming languages including Python, JavaScript, Java, C++, Go, Rust, and more. Syntax highlighting and autocomplete work out of the box." },
            { q: "Is the video conferencing reliable?", a: "Yes, we use enterprise-grade WebRTC infrastructure powered by Stream.io. It ensures ultra-low latency (<50ms) and HD quality even on slower connections." },
            { q: "How does the Anti-Cheat system work?", a: "Our anti-cheat engine monitors tab switches, copy-paste events, and unusual typing speeds. It compiles a trust score that helps interviewers make informed decisions." },
            { q: "Can I try it before buying?", a: "Absolutely! You can start for free with up to 5 interviews per month. No credit card required." }
          ].map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="collapse collapse-arrow glass-card border border-white/5"
            >
              <input type="checkbox" defaultChecked={i === 0} /> 
              <div className="collapse-title text-lg font-semibold text-base-content">
                {faq.q}
              </div>
              <div className="collapse-content text-base-content/60">
                <p>{faq.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative max-w-7xl mx-auto px-6 py-24">
        <div className="relative glass-card rounded-3xl overflow-hidden p-12 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/25 rounded-full px-4 py-2 text-sm text-violet-300 font-medium mb-6">
              <ZapIcon className="size-3.5" />
              Start in 30 seconds
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Ready to transform your
              <br />
              <span className="gradient-text">interview process?</span>
            </h2>
            <p className="text-base-content/55 mb-8 max-w-lg mx-auto">
              Join thousands of engineers who conduct better interviews with InterviewVerse. Free to start, no credit card needed.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {["No setup required", "Free forever plan", "HD video included"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-base-content/60">
                  <CheckCircleIcon className="size-4 text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>

            <SignInButton mode="modal">
              <button className="btn-gradient inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-lg font-bold shine-on-hover text-white">
                <SparklesIcon className="size-5" />
                Get Started Free
                <ArrowRightIcon className="size-5" />
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 mt-16 px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 120 120" fill="none" className="h-12 w-auto object-contain drop-shadow-sm text-base-content">
                <defs>
                  <filter id="cyanGlowFooter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <g filter="url(#cyanGlowFooter)">
                  <path d="M25 25 h 16 v 70 h -16 z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M33 33 v 54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 25 L 75 85 L 100 25" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M62 25 L 75 60 L 88 25" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                </g>
              </svg>
              <span className="text-2xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="font-black text-base-content tracking-tight drop-shadow-sm">Interview</span>
                <span className="font-bold text-cyan-500 tracking-wide drop-shadow-sm">Verse</span>
              </span>
            </div>
            <p className="text-sm text-base-content max-w-sm mb-6">
              The modern way to conduct technical interviews. Live video, real-time code editing, and integrated AI tools.
            </p>
            <div className="flex gap-4 text-base-content/80">
              <a href="#" className="hover:text-base-content/80 transition-colors"><TwitterIcon className="size-5" /></a>
              <a href="#" className="hover:text-base-content/80 transition-colors"><GithubIcon className="size-5" /></a>
              <a href="#" className="hover:text-base-content/80 transition-colors"><LinkedinIcon className="size-5" /></a>
            </div>
          </div>
          <div className="flex flex-col items-start pt-8">
            <div className="flex flex-col items-start gap-3 text-sm text-base-content/80 w-full">
              <a href="#features" className="hover:text-base-content hover:font-bold hover:translate-x-1 transition-all">Features</a>
              <a href="#testimonials" className="hover:text-base-content hover:font-bold hover:translate-x-1 transition-all">Testimonials</a>
              <a href="#faq" className="hover:text-base-content hover:font-bold hover:translate-x-1 transition-all">FAQ</a>
              <SignInButton mode="modal">
                <button className="hover:text-base-content hover:font-bold hover:translate-x-1 transition-all text-left">Login</button>
              </SignInButton>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <h4 className="font-normal mb-4 text-base-content">Subscribe</h4>
            <p className="text-xs text-base-content/80 mb-3">Get the latest updates and interview tips.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input 
                  type="email" 
                  required
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="input input-sm input-bordered bg-base-100/50 w-full focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all" 
                />
                <button 
                  type="submit" 
                  disabled={subscribeStatus === "loading" || subscribeStatus === "success"}
                  className="btn btn-sm btn-primary bg-violet-500 hover:bg-violet-600 border-none text-white w-24"
                >
                  {subscribeStatus === "loading" ? <span className="loading loading-spinner loading-xs"></span> : subscribeStatus === "success" ? <CheckCircleIcon className="size-4" /> : "Subscribe"}
                </button>
              </div>
              {subscribeStatus === "success" && <span className="text-xs text-emerald-400 font-medium">Thanks for subscribing! We'll be in touch.</span>}
            </form>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <p className="text-xs text-base-content/60">
            © 2025 InterviewVerse. Built with ❤️ for engineers.
          </p>
          <div className="flex gap-6 text-xs text-base-content/70">
            <a href="#" className="hover:text-base-content/70 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-base-content/70 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Video Demo Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0f18]/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl bg-[#121827] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0f18]/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/80"></div>
                  <div className="size-3 rounded-full bg-yellow-500/80"></div>
                  <div className="size-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="text-sm font-medium text-white/50">InterviewVerse Platform Demo</span>
              </div>
              <button onClick={() => setIsVideoModalOpen(false)} className="text-white/50 hover:text-white transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="w-full aspect-video bg-[#0a0f18] flex items-center justify-center">
              <img src="/platform_demo.webp" alt="Platform Demo Recording" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default HomePage;
