import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      default: "To be assigned",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    candidateName: {
      type: String,
      required: true,
    },
    candidateEmail: {
      type: String,
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    waitingParticipant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed"],
      default: "active",
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    // stream video call ID
    callId: {
      type: String,
      default: "",
    },
    evaluationNotes: {
      type: String,
      default: "",
    },
    finalCode: {
      type: String,
      default: "",
    },
    finalLanguage: {
      type: String,
      default: "javascript",
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
