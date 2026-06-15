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
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    maxParticipants: {
      type: Number,
      default: 2, // 2 = 1-on-1, 5 = Panel
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
    // Scoring
    metrics: {
      communication: { type: Number, min: 1, max: 10, default: null },
      codeQuality: { type: Number, min: 1, max: 10, default: null },
      logic: { type: Number, min: 1, max: 10, default: null },
    },
    timeline: [{
      type: { type: String, required: true }, // e.g., 'TAB_SWITCH', 'LARGE_PASTE', 'SYSTEM'
      timestamp: { type: Date, default: Date.now },
      message: { type: String, required: true },
    }],
    startedAt: {
      type: Date,
      default: null,
    },
    overallRating: {
      type: String,
      enum: ["Strong Hire", "Hire", "No Hire", "Strong No Hire", ""],
      default: "",
    },
    sharedWithCandidate: {
      type: Boolean,
      default: false,
    },
    codeSnapshots: [{
      code: { type: String, required: true },
      language: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      output: { type: String, default: "" }, // Optional: Can store execution output too
    }],
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
