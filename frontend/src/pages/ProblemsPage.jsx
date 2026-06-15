import { useState } from "react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";

import { useProblems } from "../hooks/useProblems";
import { ChevronRightIcon, Code2Icon, Loader2Icon, SearchIcon, FilterIcon, XCircleIcon, BookOpenIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const { data: problemsData, isLoading } = useProblems();
  const problems = problemsData || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Derive unique categories
  const categories = ["All", ...new Set(problems.map((p) => p.category).filter(Boolean))];

  // Apply filters
  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      difficultyFilter === "All" || p.difficulty === difficultyFilter;

    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter;

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  const hasActiveFilters =
    searchQuery !== "" || difficultyFilter !== "All" || categoryFilter !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setDifficultyFilter("All");
    setCategoryFilter("All");
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <Loader2Icon className="animate-spin size-10 text-violet-400" />
      </div>
    );

  return (
    <div className="min-h-screen bg-mesh overflow-x-hidden text-base-content">
      {/* Grid overlay */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />

      <Navbar />

      <main className="relative max-w-6xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-400 mb-4">
              <BookOpenIcon className="size-3.5" />
              Problem Library
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
              Practice <span className="gradient-text">Problems</span>
            </h1>
            <p className="text-lg text-base-content/60">
              Sharpen your coding skills with curated algorithmic challenges
            </p>
          </div>
          
          {/* STATS CHIPS */}
          <div className="flex items-center gap-3 glass-card px-5 py-3 rounded-2xl">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-xl font-black text-emerald-400">{easyProblemsCount}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-50">Easy</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-xl font-black text-amber-400">{mediumProblemsCount}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-50">Medium</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xl font-black text-rose-400">{hardProblemsCount}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold opacity-50">Hard</div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="glass-card rounded-3xl p-5 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <SearchIcon className="size-4 text-base-content/40" />
              </div>
              <input
                type="text"
                placeholder="Search by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-base-200/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
              />
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FilterIcon className="size-3.5 text-base-content/40" />
                </div>
                <select
                  className="w-full pl-9 pr-8 py-3 bg-base-200/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none text-sm cursor-pointer"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <select
                  className="w-full px-4 py-3 bg-base-200/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none text-sm cursor-pointer"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "All" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition-colors flex items-center gap-2 text-sm font-semibold shrink-0"
                  onClick={clearFilters}
                >
                  <XCircleIcon className="size-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs font-medium text-base-content/50">
            <span>
              Showing <span className="text-violet-400 font-bold">{filteredProblems.length}</span> of {problems.length} problems
            </span>
          </div>
        </div>

        {/* PROBLEMS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProblems.length === 0 ? (
            <div className="col-span-full glass-card rounded-3xl py-24 text-center border-dashed border-2 border-base-content/10">
              <div className="size-20 mx-auto mb-6 bg-base-200 border border-white/5 rounded-full flex items-center justify-center shadow-inner">
                <SearchIcon className="size-10 text-base-content/30" />
              </div>
              <h3 className="text-xl font-bold mb-2">No problems found</h3>
              <p className="text-base-content/50 mb-6 max-w-sm mx-auto">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <button className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-bold text-white shine-on-hover" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredProblems.map((problem, i) => (
              <Link
                key={problem._id}
                to={`/problem/${problem._id}`}
                className="glass-card card-lift group p-5 animate-slide-up relative overflow-hidden block"
                style={{ animationDelay: `${(i % 10) * 0.05}s` }}
              >
                {/* Decorative gradient blur */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-violet-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 size-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Code2Icon className="size-6 text-violet-400" />
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-bold text-base-content mb-1.5 group-hover:text-violet-400 transition-colors">
                        {problem.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${getDifficultyBadgeClass(problem.difficulty)} border`}>
                          {problem.difficulty}
                        </span>
                        {problem.category && (
                          <span className="text-[10px] font-bold text-base-content/50 bg-base-content/5 border border-base-content/10 px-2 py-0.5 rounded-md">
                            {problem.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 size-8 rounded-full bg-base-content/5 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 text-base-content/40">
                    <ChevronRightIcon className="size-4" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default ProblemsPage;
