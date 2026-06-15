import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import { useYjsStore } from "../hooks/useYjsStore";

function Whiteboard({ roomId }) {
  const yjsUrl = import.meta.env.VITE_YJS_URL || "wss://demos.yjs.dev/ws";
  const storeWithStatus = useYjsStore({ 
    roomId: `session-${roomId}`,
    hostUrl: yjsUrl,
  });

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
      {storeWithStatus.status === 'loading' ? (
        <div className="flex items-center justify-center h-full">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <Tldraw store={storeWithStatus.store} inferDarkMode={true} />
      )}
    </div>
  );
}

export default Whiteboard;
