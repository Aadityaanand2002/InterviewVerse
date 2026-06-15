import {
  CallingState,
  SpeakerLayout,
  PaginatedGridLayout,
  CallParticipantsList,
  CallStatsButton,
  useCallStateHooks,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
  CancelCallButton,
  DeviceSettings,
  ReactionsButton,
  useCall,
  useConnectedUser,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon, LayoutGridIcon, HandIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import toast from "react-hot-toast";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const participants = useParticipants();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [layout, setLayout] = useState("speaker");

  // Hand Raise Feature State
  const call = useCall();
  const connectedUser = useConnectedUser();
  const [raisedHands, setRaisedHands] = useState(new Set());
  const isHandRaised = raisedHands.has(connectedUser?.id);

  useEffect(() => {
    if (!call) return;

    const unsubscribe = call.on("custom", (event) => {
      const { custom, user } = event;
      if (custom.type === "raise_hand") {
        setRaisedHands((prev) => {
          const newSet = new Set(prev);
          newSet.add(user.id);
          return newSet;
        });
        toast(`${user.name} raised their hand!`, {
          icon: "✋",
          style: { background: "rgba(139, 92, 246, 0.2)", color: "#c4b5fd", border: "1px solid rgba(139, 92, 246, 0.3)" }
        });
      } else if (custom.type === "lower_hand") {
        setRaisedHands((prev) => {
          const newSet = new Set(prev);
          newSet.delete(user.id);
          return newSet;
        });
      }
    });

    return () => unsubscribe();
  }, [call]);

  const handleToggleHandRaise = async () => {
    if (!call || !connectedUser) return;
    
    const eventType = isHandRaised ? "lower_hand" : "raise_hand";
    
    // Optimistic update
    setRaisedHands((prev) => {
      const newSet = new Set(prev);
      if (isHandRaised) newSet.delete(connectedUser.id);
      else newSet.add(connectedUser.id);
      return newSet;
    });

    try {
      await call.sendCustomEvent({ type: eventType });
    } catch (error) {
      console.error("Failed to send hand raise event", error);
      // Revert optimistic update
      setRaisedHands((prev) => {
        const newSet = new Set(prev);
        if (isHandRaised) newSet.add(connectedUser.id);
        else newSet.delete(connectedUser.id);
        return newSet;
      });
    }
  };

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-3 relative str-video">
      <div className="flex-1 flex flex-col gap-3">
        {/* Participants count badge and Chat Toggle */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`btn btn-sm gap-2 ${showParticipants ? "btn-primary" : "btn-ghost"}`}
            >
              <UsersIcon className="w-4 h-4" />
              <span className="font-semibold">
                {participantCount} {participantCount === 1 ? "participant" : "participants"}
              </span>
              {raisedHands.size > 0 && (
                <div className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-1">
                  <HandIcon className="w-3 h-3 fill-amber-400" />
                  {raisedHands.size}
                </div>
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayout(layout === "speaker" ? "grid" : "speaker")}
              className="btn btn-sm btn-ghost gap-2"
              title="Toggle Layout"
            >
              <LayoutGridIcon className="w-4 h-4" />
              {layout === "speaker" ? "Grid View" : "Speaker View"}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-base-300 rounded-lg overflow-hidden relative">
          {layout === "speaker" ? <SpeakerLayout /> : <PaginatedGridLayout />}
        </div>

        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center items-center gap-4 relative">
          <CallStatsButton />
          
          <div className="flex items-center gap-2">
            <ToggleAudioPublishingButton />
            <ToggleVideoPublishingButton />
          </div>
          
          <div className="divider divider-horizontal m-0"></div>
          
          <div className="flex items-center gap-2">
            <ScreenShareButton />
            <ReactionsButton />
            <button
              onClick={handleToggleHandRaise}
              className={`btn btn-circle btn-sm ${isHandRaised ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30" : "btn-ghost text-base-content/70"}`}
              title={isHandRaised ? "Lower Hand" : "Raise Hand"}
            >
              <HandIcon className={`size-5 ${isHandRaised ? "fill-amber-400" : ""}`} />
            </button>
          </div>

          <div className="divider divider-horizontal m-0"></div>

          <div className="flex items-center gap-2">
            {chatClient && channel && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`btn btn-circle btn-sm ${isChatOpen ? "bg-primary/20 text-primary hover:bg-primary/30 border-primary/30" : "btn-ghost text-base-content/70"}`}
                title={isChatOpen ? "Hide chat" : "Show chat"}
              >
                <MessageSquareIcon className="size-5" />
              </button>
            )}
            <DeviceSettings />
            <CancelCallButton onLeave={() => navigate("/dashboard")} />
          </div>
        </div>
      </div>

      {/* PARTICIPANTS SECTION */}
      {showParticipants && (
        <div className="w-80 flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30]">
          <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
            <h3 className="font-semibold text-white">Participants</h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close participants"
            >
              <XIcon className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
            {/* Raised Hands Queue */}
            {raisedHands.size > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <HandIcon className="w-3 h-3 fill-amber-400" />
                  Raised Hands ({raisedHands.size})
                </h4>
                <div className="flex flex-col gap-2 mt-1">
                  {participants
                    .filter((p) => raisedHands.has(p.userId))
                    .map((p) => (
                      <div key={p.userId} className="flex items-center gap-2 text-sm text-amber-100">
                        <img 
                          src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'User')}`} 
                          alt={p.name} 
                          className="w-6 h-6 rounded-full border border-amber-500/30"
                        />
                        <span className="truncate">{p.name || p.userId}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        </div>
      )}

      {/* CHAT SECTION */}

      {chatClient && channel && (
        <div
          className={`flex flex-col rounded-lg shadow overflow-hidden bg-[#272a30] transition-all duration-300 ease-in-out ${
            isChatOpen ? "w-80 opacity-100" : "w-0 opacity-0"
          }`}
        >
          {isChatOpen && (
            <>
              <div className="bg-[#1c1e22] p-3 border-b border-[#3a3d44] flex items-center justify-between">
                <h3 className="font-semibold text-white">Session Chat</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Close chat"
                >
                  <XIcon className="size-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden stream-chat-dark">
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </Channel>
                </Chat>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
export default VideoCallUI;
