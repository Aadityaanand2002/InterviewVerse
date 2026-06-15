import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon, UsersIcon, WifiIcon, WifiOffIcon, SendIcon } from "lucide-react";
import { LANGUAGE_CONFIG } from "../data/problems";
import { useCollaborativeCode } from "../hooks/useCollaborativeCode";

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  onSubmit,
  onCheatAlert,
  // Collaboration props (optional — only passed from SessionPage)
  sessionId,
  isCollaborative,
}) {
  const editorRef = useRef(null);
  const [editorMounted, setEditorMounted] = useState(false);

  // Real-time code collaboration via Yjs
  const { isConnected } = useCollaborativeCode({
    sessionId,
    editor: editorRef.current,
    enabled: !!isCollaborative && !!sessionId && editorMounted,
    selectedLanguage,
  });

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    setEditorMounted(true);

    // Anti-cheat paste detection
    editor.onDidPaste((e) => {
      const pastedText = editor.getModel().getValueInRange(e.range);
      if (pastedText.length > 50 && onCheatAlert) {
        onCheatAlert("large_paste");
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22]/90 backdrop-blur-md border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/20 px-2 py-1.5 rounded-xl border border-white/5">
            <img
              src={LANGUAGE_CONFIG[selectedLanguage].icon}
              alt={LANGUAGE_CONFIG[selectedLanguage].name}
              className="size-5"
            />
            <select 
              className="bg-transparent border-none outline-none text-sm font-semibold text-base-content/80 cursor-pointer appearance-none pr-2 focus:ring-0" 
              value={selectedLanguage} 
              onChange={onLanguageChange}
            >
              {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
                <option key={key} value={key} className="bg-base-200">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Collaboration status badge */}
          {isCollaborative && (
            <div
              className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-lg border ${
                isConnected
                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : "text-amber-400 border-amber-500/20 bg-amber-500/10"
              }`}
              title={isConnected ? "Collaborative editing active" : "Connecting..."}
            >
              <UsersIcon className="w-3 h-3" />
              {isConnected ? (
                <>
                  <WifiIcon className="w-3 h-3" />
                  Live
                </>
              ) : (
                <>
                  <WifiOffIcon className="w-3 h-3" />
                  Connecting
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          >
            {isRunning ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <PlayIcon className="size-4" />
            )}
            <span className="text-sm font-semibold">Run Code</span>
          </button>
          
          <button
            onClick={onSubmit}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,92,246,0.4)]"
          >
            <SendIcon className="size-4" />
            <span className="text-sm font-bold tracking-wide">Submit</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[selectedLanguage].monacoLang}
          // In collaborative mode, Yjs controls the value — don't pass value/onChange
          value={isCollaborative ? undefined : code}
          onChange={isCollaborative ? undefined : onCodeChange}
          onMount={handleEditorMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
            padding: { top: 20 },
            renderWhitespace: "none",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditorPanel;
