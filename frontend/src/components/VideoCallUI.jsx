import {
  CallControls,
  CallingState,
  SpeakerLayout,
  PaginatedGridLayout,
  CallParticipantsList,
  CallStatsButton,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon, LayoutGridIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel }) {
  const navigate = useNavigate();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [layout, setLayout] = useState("speaker");

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
            <div className="divider divider-horizontal m-0"></div>
            {chatClient && channel && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
                title={isChatOpen ? "Hide chat" : "Show chat"}
              >
                <MessageSquareIcon className="size-4" />
                Chat
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 bg-base-300 rounded-lg overflow-hidden relative">
          {layout === "speaker" ? <SpeakerLayout /> : <PaginatedGridLayout />}
        </div>

        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center items-center gap-2">
          <CallStatsButton />
          <CallControls onLeave={() => navigate("/dashboard")} />
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
          <div className="flex-1 overflow-auto p-4">
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
