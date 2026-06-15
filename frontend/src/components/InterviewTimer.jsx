import { useState, useEffect } from "react";
import { ClockIcon } from "lucide-react";
import toast from "react-hot-toast";

function InterviewTimer({ startedAt }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isWarning, setIsWarning] = useState(false);
  const [isNegative, setIsNegative] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (!startedAt) return;

    const startTime = new Date(startedAt).getTime();
    const DURATION_MS = 45 * 60 * 1000; // 45 minutes

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remainingMs = DURATION_MS - elapsed;

      const isNeg = remainingMs < 0;
      setIsNegative(isNeg);

      const absRemaining = Math.abs(remainingMs);
      const minutes = Math.floor(absRemaining / 60000);
      const seconds = Math.floor((absRemaining % 60000) / 1000);

      const formatted = `${isNeg ? "-" : ""}${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      setTimeLeft(formatted);

      // Warning at 5 minutes remaining
      if (!isNeg && remainingMs <= 5 * 60 * 1000) {
        setIsWarning(true);
        if (!hasShownToast && remainingMs <= 5 * 60 * 1000 && remainingMs > (5 * 60 * 1000 - 2000)) {
          // Only show toast right when it crosses the 5 min mark
          toast("5 minutes remaining!", { icon: "⏳", style: { background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.3)" } });
          setHasShownToast(true);
        }
      } else {
        setIsWarning(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt, hasShownToast]);

  if (!startedAt) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold font-mono transition-colors ${isNegative ? "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse" : isWarning ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/5 border-white/10 text-base-content/80"}`}>
      <ClockIcon className="size-4" />
      {timeLeft}
    </div>
  );
}

export default InterviewTimer;
