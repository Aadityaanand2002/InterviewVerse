import re

with open('/Users/adityamacbookair/Desktop/Interview Platform/frontend/src/pages/SessionPage.jsx', 'r') as f:
    lines = f.readlines()

# We want to replace from the start of `<main className="flex-1 min-h-0 relative w-full p-2 z-10">`
# down to just before `<dialog id="solution_modal" className="modal">`

main_start = -1
dialog_start = -1

for i, line in enumerate(lines):
    if '<main className="flex-1 min-h-0 relative w-full p-2 z-10">' in line:
        main_start = i
    if '<dialog id="solution_modal" className="modal">' in line:
        dialog_start = i

if main_start == -1 or dialog_start == -1:
    print(f"Error: main_start={main_start}, dialog_start={dialog_start}")
    exit(1)

# The correct structure we want from `main_start` to `dialog_start` is:
correct_main_code = """      <main className="flex-1 min-h-0 relative w-full p-2 z-10">
        <div className="absolute inset-0 p-2">
          <PanelGroup direction="horizontal" className="h-full w-full">
            
            {/* PANEL 1 - PROBLEM DETAILS & HOST CONTROLS */}
            <Panel defaultSize={25} minSize={20}>
              <div className="h-full flex flex-col bg-base-100/30 backdrop-blur-sm rounded-2xl border border-white/10 m-1 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] pointer-events-none" />
                
                {/* HEADER SECTION */}
                <div className="p-4 md:p-6 bg-[#0d1117]/60 border-b border-white/5 shrink-0 relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {isHost ? (
                        <select
                          className="select select-sm w-full"
                          value={problemData?.title || ""}
                          onChange={handleProblemChange}
                        >
                          <option value="" disabled>Select a problem</option>
                          {problems.map((p) => (
                            <option key={p.title} value={p.title}>
                              {p.title} - {p.difficulty}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <h1 className="text-xl md:text-3xl font-bold text-base-content">
                          {session?.problem || "Loading..."}
                        </h1>
                      )}
                      {problemData?.category && (
                        <p className="text-base-content/60 mt-1">{problemData.category}</p>
                      )}
                      <p className="text-base-content/60 mt-2">
                        Host: {session?.host?.name || "Loading..."} •{" "}
                        {session?.participant ? 2 : 1}/2 participants
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${getDifficultyBadgeClass(
                          session?.difficulty
                        )}`}
                      >
                        {session?.difficulty || "EASY"}
                      </span>
                      {isHost && session?.status === "active" && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Invite link copied!", {
                              style: { background: "rgba(16, 185, 129, 0.1)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.2)" },
                            });
                          }}
                          className="btn btn-outline border-white/10 hover:bg-white/5 text-base-content/80 btn-xs md:btn-sm gap-1 md:gap-2"
                        >
                          <CopyIcon className="w-3 h-3 md:w-4 md:h-4" />
                          Copy Link
                        </button>
                      )}
                      {isHost && session?.status === "active" && problemData?.solutionCode?.[selectedLanguage] && (
                        <button
                          onClick={() => document.getElementById('solution_modal').showModal()}
                          className="btn btn-outline border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 btn-xs md:btn-sm gap-1 md:gap-2"
                        >
                          View Solution
                        </button>
                      )}
                      {isHost && session?.status === "active" && (
                        <button
                          onClick={handleEndSession}
                          disabled={endSessionMutation.isPending}
                          className="btn bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 btn-xs md:btn-sm gap-1 md:gap-2"
                        >
                          {endSessionMutation.isPending ? (
                            <Loader2Icon className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                          ) : (
                            <LogOutIcon className="w-3 h-3 md:w-4 md:h-4" />
                          )}
                          End Session
                        </button>
                      )}
                      {session?.status === "completed" && (
                        <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-base-content/10 text-base-content/60">Completed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* PROBLEM / CHAT TABS */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-[#161b22]/90 backdrop-blur-md shrink-0">
                  <button
                    onClick={() => setLeftTab("problem")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      leftTab === "problem"
                        ? "bg-white/10 text-violet-400"
                        : "text-base-content/50 hover:text-base-content/80 hover:bg-white/5"
                    }`}
                  >
                    <BookOpenIcon className="size-4" />
                    Problem
                  </button>
                  <button
                    onClick={() => setLeftTab("chat")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      leftTab === "chat"
                        ? "bg-white/10 text-cyan-400"
                        : "text-base-content/50 hover:text-base-content/80 hover:bg-white/5"
                    }`}
                  >
                    <MessageSquareIcon className="size-4" />
                    Chat
                  </button>
                </div>

                <div className="flex-1 overflow-hidden min-h-0 relative z-10">
                  {leftTab === "problem" ? (
                    <ProblemDescription
                      problem={
                        problemData || {
                          title: "To be assigned",
                          difficulty: "Easy",
                          category: "TBD",
                          description: { text: "Waiting for the interviewer to assign a problem...", notes: [] },
                          examples: [],
                          constraints: [],
                        }
                      }
                      currentProblemId={problemData?.title || ""}
                      onProblemChange={isHost ? handleProblemChange : null}
                      allProblems={problems}
                    />
                  ) : (
                    <div className="h-full bg-[#0d1117] stream-chat-custom-theme">
                      {chatClient && channel ? (
                        <Chat client={chatClient} theme="str-chat__theme-dark">
                          <Channel channel={channel}>
                            <Window>
                              <MessageList />
                              <MessageInput focus />
                            </Window>
                          </Channel>
                        </Chat>
                      ) : (
                        <div className="flex items-center justify-center h-full text-base-content/50">
                          <Loader2Icon className="animate-spin size-6" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* EVALUATION NOTES + SCORING (HOST ONLY) */}
                {isHost && (
                  <div className="bg-[#0d1117]/80 p-4 md:p-5 border-t border-white/5 shrink-0 flex flex-col gap-4 relative z-10">
                    {/* Score row */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Score:</span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          className="w-16 px-2 py-1.5 bg-base-200/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm font-mono text-center"
                          placeholder="1-10"
                          value={candidateScore ?? ""}
                          onChange={(e) => setCandidateScore(e.target.value ? Number(e.target.value) : null)}
                        />
                        <span className="text-xs text-base-content/40 font-mono">/10</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Rating:</span>
                        <select
                          className="px-3 py-1.5 bg-base-200/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm appearance-none cursor-pointer"
                          value={overallRating}
                          onChange={(e) => setOverallRating(e.target.value)}
                        >
                          <option value="">-- Select --</option>
                          <option value="Strong Hire">💚 Strong Hire</option>
                          <option value="Hire">✅ Hire</option>
                          <option value="No Hire">❌ No Hire</option>
                          <option value="Strong No Hire">🚫 Strong No Hire</option>
                        </select>
                      </div>
                      <button
                        className="px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-bold hover:bg-emerald-500/20 transition-colors"
                        onClick={handleSaveScore}
                        disabled={updateSessionScoreMutation.isPending}
                      >
                        {updateSessionScoreMutation.isPending ? "Saving..." : "Save Score"}
                      </button>
                    </div>

                    {/* Notes */}
                    <details className="group">
                      <summary className="text-sm font-bold text-violet-400 flex items-center justify-between shrink-0 uppercase tracking-wider cursor-pointer select-none outline-none hover:bg-white/5 p-2 rounded-lg transition-colors">
                        <span className="flex items-center gap-2">📝 Private Evaluation Notes</span>
                        <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-3 flex flex-col gap-3">
                        <textarea
                          className="w-full h-24 p-3 bg-base-200/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm resize-none custom-scrollbar"
                          placeholder="Write your private notes about the candidate here."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                        <button 
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-base-content/80 text-sm font-bold hover:bg-white/10 transition-colors self-start shrink-0"
                          onClick={handleSaveNotes}
                          disabled={updateSessionNotesMutation.isPending}
                        >
                          {updateSessionNotesMutation.isPending ? "Saving..." : "Save Notes"}
                        </button>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

            {/* PANEL 2 - CODE EDITOR */}
            <Panel defaultSize={50} minSize={30}>
              <div className="flex flex-col h-full w-full bg-base-100/30 backdrop-blur-sm rounded-2xl border border-white/10 m-1 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none" />
                {/* MODE TOGGLE */}
                <div className="flex items-center justify-between p-3 bg-[#161b22]/90 backdrop-blur-md border-b border-white/5 shrink-0 relative z-10">
                  <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                    <button 
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "code" ? "bg-white/10 text-cyan-400 shadow-sm" : "text-base-content/50 hover:text-base-content/80 hover:bg-white/5"}`}
                      onClick={() => setActiveTab("code")}
                    >
                      Code Editor
                    </button>
                    <button 
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "whiteboard" ? "bg-white/10 text-cyan-400 shadow-sm" : "text-base-content/50 hover:text-base-content/80 hover:bg-white/5"}`}
                      onClick={() => setActiveTab("whiteboard")}
                    >
                      Whiteboard
                    </button>
                  </div>
                  <button 
                    className="btn btn-sm btn-ghost btn-square" 
                    onClick={handleFullscreen}
                    title="Toggle Fullscreen"
                  >
                    <MaximizeIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 relative w-full min-h-0 overflow-hidden">
                  <div className="absolute inset-0">
                    {activeTab === "code" ? (
                      <PanelGroup direction="vertical" className="h-full w-full">
                        <Panel defaultSize={70} minSize={30}>
                          <CodeEditorPanel
                            selectedLanguage={selectedLanguage}
                            code={code}
                            isRunning={isRunning}
                            onLanguageChange={handleLanguageChange}
                            onCodeChange={(value) => setCode(value)}
                            onRunCode={handleRunCode}
                            onSubmit={handleSubmitHiddenTests}
                            onCheatAlert={handleCheatAlert}
                            sessionId={id}
                            isCollaborative={true}
                          />
                        </Panel>

                        <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                        <Panel defaultSize={30} minSize={15}>
                          <OutputPanel output={output} testcases={problemData?.examples || []} />
                        </Panel>
                      </PanelGroup>
                    ) : (
                      <Whiteboard roomId={id} />
                    )}
                  </div>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

            {/* PANEL 3 - VIDEO CALLS & CHAT */}
            <Panel defaultSize={25} minSize={20}>
              <div className="h-full bg-base-200 p-4 overflow-auto rounded-2xl m-1 border border-white/10">
                {isInitializingCall ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                      <p className="text-lg">Connecting to video call...</p>
                    </div>
                  </div>
                ) : !streamClient || !call ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="card bg-base-100 shadow-xl max-w-md">
                      <div className="card-body items-center text-center">
                        <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                          <PhoneOffIcon className="w-12 h-12 text-error" />
                        </div>
                        <h2 className="card-title text-2xl">Connection Failed</h2>
                        <p className="text-base-content/70">Unable to connect to the video call</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <StreamVideo client={streamClient}>
                      <StreamCall call={call}>
                        <VideoCallUI chatClient={chatClient} channel={channel} />
                      </StreamCall>
                    </StreamVideo>
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </main>
"""

lines = lines[:main_start] + [correct_main_code] + lines[dialog_start:]

with open('/Users/adityamacbookair/Desktop/Interview Platform/frontend/src/pages/SessionPage.jsx', 'w') as f:
    f.writelines(lines)

print("SUCCESS")
