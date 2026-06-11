import { FileTextIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemDescription({ problem, currentProblemId, onProblemChange, allProblems }) {
  // If imported from LeetCode, HTML is in description.text
  // Some LeetCode problems have `&nbsp;`, `<pre>`, `<code>`. We will use dangerouslySetInnerHTML.
  const hasHtml = /<[a-z][\s\S]*>/i.test(problem.description.text);

  return (
    <div className="h-full flex flex-col bg-base-100 rounded-lg overflow-hidden border border-base-300">
      {/* TABS (LeetCode style) */}
      <div className="flex bg-base-200 px-2 pt-2 border-b border-base-300 shrink-0">
        <div className="px-4 py-2 bg-base-100 border-t-2 border-t-primary rounded-t-md text-sm font-semibold flex items-center gap-2 text-primary">
          <FileTextIcon className="size-4" />
          Description
        </div>
        {/* We can add 'Editorial', 'Solutions' later if needed */}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-base-100 prose prose-sm md:prose-base max-w-none dark:prose-invert">
        {/* Problem selector (for sessions) */}
        {onProblemChange && allProblems && (
          <div className="mb-6 max-w-xs">
            <select
              className="select select-bordered select-sm w-full font-semibold"
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

        <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
        
        <div className="flex items-center gap-3 mb-6">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            problem.difficulty === 'Easy' ? 'bg-success/20 text-success' : 
            problem.difficulty === 'Medium' ? 'bg-warning/20 text-warning' : 
            'bg-error/20 text-error'
          }`}>
            {problem.difficulty}
          </span>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-base-200 text-base-content/70">
            {problem.category}
          </span>
        </div>

        {/* Problem Description Text */}
        <div className="text-base-content/90 mb-8 leading-relaxed">
          {hasHtml ? (
            <div dangerouslySetInnerHTML={{ __html: problem.description.text }} className="leetcode-html" />
          ) : (
            <div className="whitespace-pre-wrap">{problem.description.text}</div>
          )}
          {problem.description.notes && problem.description.notes.length > 0 && problem.description.notes.map((note, idx) => (
            <p key={idx} className="mt-4 text-base-content/80 italic border-l-2 border-base-300 pl-4">{note}</p>
          ))}
        </div>

        {/* Fallback rendering for manually added Examples if HTML is not present */}
        {!hasHtml && problem.examples && problem.examples.length > 0 && (
          <div className="mb-8">
            {problem.examples.map((example, idx) => (
              <div key={idx} className="mb-6">
                <p className="font-bold mb-2">Example {idx + 1}:</p>
                <div className="bg-base-200 rounded-md p-4 font-mono text-sm border-l-4 border-base-300">
                  <p><strong className="select-none">Input: </strong>{example.input}</p>
                  <p><strong className="select-none">Output: </strong>{example.output}</p>
                  {example.explanation && <p><strong className="select-none">Explanation: </strong>{example.explanation}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback rendering for manually added Constraints if HTML is not present */}
        {!hasHtml && problem.constraints && problem.constraints.length > 0 && (
          <div className="mb-8">
            <p className="font-bold mb-2">Constraints:</p>
            <ul className="list-disc pl-5">
              {problem.constraints.map((constraint, idx) => (
                <li key={idx}><code className="bg-base-200 px-1 py-0.5 rounded text-sm">{constraint}</code></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemDescription;
