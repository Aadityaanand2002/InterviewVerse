import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

function Whiteboard() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
      <Tldraw inferDarkMode={true} />
    </div>
  );
}

export default Whiteboard;
