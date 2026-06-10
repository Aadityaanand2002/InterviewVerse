import { useState, useEffect, useRef } from "react";
import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon, Loader2Icon } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

function MeetingSetup({ session, isHost, isParticipant, onJoin, onAskToJoin, askToJoinPending }) {
  const { user } = useUser();
  const [isCamOn, setIsCamOn] = useState(() => {
    const saved = localStorage.getItem("interview-cam-mic-state");
    return saved ? JSON.parse(saved).isCamOn : true;
  });
  const [isMicOn, setIsMicOn] = useState(() => {
    const saved = localStorage.getItem("interview-cam-mic-state");
    return saved ? JSON.parse(saved).isMicOn : true;
  });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCamOn(true);
      setIsMicOn(true);
    } catch (err) {
      console.error("Failed to get media devices:", err);
      setIsCamOn(false);
      setIsMicOn(false);
      import("react-hot-toast").then((module) => {
        if (err?.name === "NotAllowedError") {
          module.default.error("Microphone/Camera permission denied. Please enable it in your browser settings.");
        } else if (err?.name === "NotFoundError") {
          module.default.error("No camera or microphone found on your device.");
        } else {
          module.default.error(`Media Error: ${err.message || "Could not access camera/mic"}`);
        }
      });
    }
  };

  useEffect(() => {
    setupMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleCamera = async () => {
    if (!streamRef.current) {
      await setupMedia();
      return;
    }
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !isCamOn;
      setIsCamOn(!isCamOn);
      localStorage.setItem("interview-cam-mic-state", JSON.stringify({ isCamOn: !isCamOn, isMicOn }));
    }
  };

  const toggleMic = async () => {
    if (!streamRef.current) {
      await setupMedia();
      return;
    }
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !isMicOn;
      setIsMicOn(!isMicOn);
      localStorage.setItem("interview-cam-mic-state", JSON.stringify({ isCamOn, isMicOn: !isMicOn }));
    }
  };

  const handleJoin = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    onJoin({ isCamOn, isMicOn });
  };

  const handleAskToJoin = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    onAskToJoin({ isCamOn, isMicOn });
  };

  // If candidate is already waiting, show waiting screen
  if (!isHost && session?.waitingParticipant?.clerkId === user?.id) {
    return (
      <div className="h-screen bg-base-100 flex flex-col items-center justify-center p-4">
        <div className="card bg-base-200 border-2 border-primary/20 max-w-md w-full p-8 text-center">
          <Loader2Icon className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Waiting for Host</h2>
          <p className="text-base-content/70">
            You have asked to join. Please wait until the host admits you into the room.
          </p>
        </div>
      </div>
    );
  }

  // Lobby screen
  return (
    <div className="h-screen bg-base-100 flex flex-col items-center justify-center p-4">
      <div className="card bg-base-200 border-2 border-base-300 max-w-2xl w-full">
        <div className="card-body items-center text-center">
          <h2 className="text-3xl font-black mb-2">Ready to join?</h2>
          <p className="text-base-content/70 mb-6">
            Make sure your environment is quiet and well-lit.
          </p>

          <div className="w-full relative bg-base-300 rounded-2xl overflow-hidden aspect-video mb-6 border border-base-100 flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isCamOn ? "hidden" : "block"} -scale-x-100`}
            />
            {!isCamOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300/80">
                <div className="w-20 h-20 bg-base-100 rounded-full flex items-center justify-center mb-4 border border-base-content/10 shadow-sm">
                  <CameraOffIcon className="w-8 h-8 text-base-content/50" />
                </div>
                <p className="font-medium text-base-content/70">Camera is off</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 w-full mb-8">
            <button
              onClick={toggleCamera}
              className={`flex-1 rounded-xl p-4 border flex flex-col items-center gap-2 transition-all ${
                isCamOn
                  ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                  : "bg-base-100 border-base-300 text-base-content hover:bg-base-300"
              }`}
            >
              {isCamOn ? <CameraIcon className="w-6 h-6" /> : <CameraOffIcon className="w-6 h-6" />}
              <span className="font-medium text-sm">Camera {isCamOn ? "On" : "Off"}</span>
            </button>
            <button
              onClick={toggleMic}
              className={`flex-1 rounded-xl p-4 border flex flex-col items-center gap-2 transition-all ${
                isMicOn
                  ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                  : "bg-base-100 border-base-300 text-base-content hover:bg-base-300"
              }`}
            >
              {isMicOn ? <MicIcon className="w-6 h-6" /> : <MicOffIcon className="w-6 h-6" />}
              <span className="font-medium text-sm">Mic {isMicOn ? "On" : "Off"}</span>
            </button>
          </div>

          <div className="w-full space-y-3">
            {isHost || isParticipant ? (
              <button 
                onClick={handleJoin}
                className="btn btn-primary w-full btn-lg"
              >
                Join Room
              </button>
            ) : (
              <button 
                onClick={handleAskToJoin}
                disabled={askToJoinPending}
                className="btn btn-primary w-full btn-lg"
              >
                {askToJoinPending ? (
                  <>
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  "Ask to Join"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeetingSetup;
