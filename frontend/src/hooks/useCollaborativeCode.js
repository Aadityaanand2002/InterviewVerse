import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const YJS_SERVER_URL = import.meta.env.VITE_YJS_URL || "wss://demos.yjs.dev/ws";

/**
 * Hook that sets up real-time collaborative editing for Monaco editor.
 * Uses Yjs Y.Text and manually syncs with Monaco editor model — no y-monaco needed.
 *
 * @param {string} sessionId - Unique session ID used as the Yjs room name
 * @param {object} editor - Monaco editor instance (from onMount callback)
 * @param {boolean} enabled - Whether collaboration is active
 * @param {string} selectedLanguage - Language key (used to namespace per-language docs)
 */
export function useCollaborativeCode({ sessionId, editor, enabled, selectedLanguage }) {
  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  const yTextRef = useRef(null);
  const isApplyingRemoteRef = useRef(false);
  const disposableRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !editor || !sessionId) return;

    // Cleanup previous session
    disposableRef.current?.dispose();
    providerRef.current?.destroy();
    ydocRef.current?.destroy();

    const roomId = `collab-${sessionId}-${selectedLanguage}`;
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const yText = ydoc.getText("monaco");
    yTextRef.current = yText;

    const provider = new WebsocketProvider(YJS_SERVER_URL, roomId, ydoc);
    providerRef.current = provider;

    provider.on("status", ({ status }) => {
      setIsConnected(status === "connected");
    });

    // Once synced with remote, set up the two-way binding
    provider.on("sync", (isSynced) => {
      if (!isSynced) return;

      const model = editor.getModel();
      if (!model) return;

      // 1. If yText already has content (from a previous participant), load it into editor
      if (yText.length > 0) {
        isApplyingRemoteRef.current = true;
        model.setValue(yText.toString());
        isApplyingRemoteRef.current = false;
      } else {
        // 2. Otherwise, push the current editor content into Yjs
        const currentCode = model.getValue();
        if (currentCode) {
          ydoc.transact(() => {
            yText.insert(0, currentCode);
          });
        }
      }

      // 3. Listen for remote Yjs changes → update Monaco
      const yObserver = (event, transaction) => {
        if (transaction.local) return; // skip our own changes

        isApplyingRemoteRef.current = true;
        try {
          const newValue = yText.toString();
          const currentValue = model.getValue();
          if (newValue !== currentValue) {
            // Preserve cursor position
            const selections = editor.getSelections();
            model.setValue(newValue);
            if (selections) editor.setSelections(selections);
          }
        } finally {
          isApplyingRemoteRef.current = false;
        }
      };
      yText.observe(yObserver);

      // 4. Listen for local Monaco changes → push to Yjs
      const disposable = model.onDidChangeContent((e) => {
        if (isApplyingRemoteRef.current) return;

        ydoc.transact(() => {
          // Apply changes in reverse order to keep offsets correct
          const changes = [...e.changes].sort((a, b) => b.rangeOffset - a.rangeOffset);
          for (const change of changes) {
            if (change.rangeLength > 0) {
              yText.delete(change.rangeOffset, change.rangeLength);
            }
            if (change.text) {
              yText.insert(change.rangeOffset, change.text);
            }
          }
        }, null); // null = local origin
      });
      disposableRef.current = disposable;

      // Cleanup observer when effect tears down
      return () => {
        yText.unobserve(yObserver);
      };
    });

    return () => {
      disposableRef.current?.dispose();
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
      setIsConnected(false);
    };
  }, [enabled, editor, sessionId, selectedLanguage]);

  return { isConnected };
}
