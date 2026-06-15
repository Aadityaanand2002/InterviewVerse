import { useState, useEffect } from "react";
import { Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const problems = Object.values(PROBLEMS);

  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setScheduleDate("");
      setScheduleTime("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (scheduleDate && scheduleTime) {
      setRoomConfig((prev) => ({
        ...prev,
        scheduledAt: `${scheduleDate}T${scheduleTime}`,
      }));
    } else {
      setRoomConfig((prev) => ({
        ...prev,
        scheduledAt: "",
      }));
    }
  }, [scheduleDate, scheduleTime, setRoomConfig]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Candidate Name</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. John Doe"
              value={roomConfig.candidateName || ""}
              onChange={(e) => setRoomConfig({ ...roomConfig, candidateName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Candidate Email</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="e.g. john@example.com"
              value={roomConfig.candidateEmail || ""}
              onChange={(e) => setRoomConfig({ ...roomConfig, candidateEmail: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Interview Type</span>
            </label>
            <div className="flex gap-4">
              <label 
                className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${(roomConfig.maxParticipants || 2) === 2 ? "border-primary bg-primary/10 text-primary" : "border-base-content/10 hover:border-base-content/20"}`} 
                onClick={() => setRoomConfig({ ...roomConfig, maxParticipants: 2 })}
              >
                <div className="text-center">
                  <span className="block font-bold">1-on-1 Interview</span>
                  <span className="block text-xs opacity-70 mt-1">Host + Candidate</span>
                </div>
              </label>
              <label 
                className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${roomConfig.maxParticipants === 99 ? "border-primary bg-primary/10 text-primary" : "border-base-content/10 hover:border-base-content/20"}`} 
                onClick={() => setRoomConfig({ ...roomConfig, maxParticipants: 99 })}
              >
                <div className="text-center">
                  <span className="block font-bold">Group Interview</span>
                  <span className="block text-xs opacity-70 mt-1">Unlimited Participants</span>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Schedule For (Optional)</span>
            </label>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-xs text-base-content/70">Date</span>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-xs text-base-content/70">Time</span>
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                If left empty, the interview starts immediately.
              </span>
            </label>
          </div>

        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.candidateName || !roomConfig.candidateEmail}
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}

            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
export default CreateSessionModal;
