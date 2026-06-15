import { FileTextIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemDescription({ problem, currentProblemId, onProblemChange, allProblems }) {
  // If imported from LeetCode, HTML is in description.text
  const hasHtml = /<[a-z][\s\S]*>/i.test(problem.description.text);

  return (
    <div className="h-full flex flex-col bg-base-100/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 m-2 shadow-xl">
      {/* TABS (LeetCode style) */}
      <div className="flex bg-base-300/50 px-2 pt-2 border-b border-white/5 shrink-0">
        <div className="px-4 py-2.5 bg-base-100/80 border-t-2 border-t-violet-500 rounded-t-xl text-sm font-bold flex items-center gap-2 text-violet-400 shadow-[0_-4px_10px_rgba(139,92,246,0.1)]">
          <FileTextIcon className="size-4" />
          Description
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[100px] pointer-events-none" />

        {/* Problem selector (for sessions) */}
        {onProblemChange && allProblems && (
          <div className="mb-8 max-w-sm relative z-10">
            <select
              className="w-full px-4 py-2.5 bg-base-200/80 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none text-sm font-bold cursor-pointer text-base-content/80 shadow-sm"
              value={currentProblemId}
              onChange={(e) => onProblemChange(e.target.value)}
            >
              {allProblems.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-4 tracking-tight text-base-content">{problem.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${getDifficultyBadgeClass(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
            {problem.category && (
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-base-content/5 border border-base-content/10 text-base-content/70">
                {problem.category}
              </span>
            )}
          </div>

          {/* Problem Description Text */}
          <div className="text-base-content/80 mb-10 leading-relaxed text-[15px]">
            {hasHtml ? (
              <div dangerouslySetInnerHTML={{ __html: problem.description.text }} className="leetcode-html" />
            ) : (
              <div className="whitespace-pre-wrap font-medium">{problem.description.text}</div>
            )}
            {problem.description.notes && problem.description.notes.length > 0 && problem.description.notes.map((note, idx) => (
              <p key={idx} className="mt-6 text-violet-300 italic border-l-2 border-violet-500/50 pl-4 py-1 bg-violet-500/5 rounded-r-lg text-sm">{note}</p>
            ))}
          </div>

          {/* Render Examples */}
          {problem.examples && problem.examples.length > 0 && (
            <div className="mb-10 space-y-6">
              {problem.examples.map((example, idx) => (
                <div key={idx} className="group">
                  <p className="font-bold mb-3 text-base-content/90 flex items-center gap-2">
                    <span className="flex items-center justify-center size-5 rounded-full bg-base-content/10 text-xs">
                      {idx + 1}
                    </span>
                    Example
                  </p>
                  <div className="bg-[#0d1117] rounded-xl p-5 font-mono text-sm border border-white/5 shadow-inner relative overflow-hidden">
                    <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-violet-500 to-cyan-500 opacity-50" />
                    <p className="mb-2"><strong className="select-none text-base-content/50 uppercase tracking-wider text-[10px] block mb-1">Input</strong><span className="text-emerald-300">{example.input}</span></p>
                    <p className={example.explanation ? "mb-2" : ""}><strong className="select-none text-base-content/50 uppercase tracking-wider text-[10px] block mb-1">Output</strong><span className="text-cyan-300">{example.output}</span></p>
                    {example.explanation && <p className="mt-4 pt-4 border-t border-white/5"><strong className="select-none text-base-content/50 uppercase tracking-wider text-[10px] block mb-1">Explanation</strong><span className="text-base-content/70">{example.explanation}</span></p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="mb-8">
              <p className="font-bold mb-4 text-base-content/90">Constraints:</p>
              <ul className="space-y-2.5">
                {problem.constraints.map((constraint, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-base-content/80 text-sm">
                    <span className="mt-1.5 size-1.5 rounded-full bg-violet-500 shrink-0" />
                    <code className="bg-[#0d1117] px-2.5 py-1 rounded-md whitespace-pre-wrap font-mono text-[13px] border border-white/5 text-violet-300 shadow-sm">{constraint}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemDescription;
