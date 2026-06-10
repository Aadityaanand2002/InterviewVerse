import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty, candidateName, candidateEmail } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty || !candidateName || !candidateEmail) {
      return res.status(400).json({ message: "Problem, difficulty, candidate name, and email are required" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db
    const session = await Session.create({ 
      problem, 
      difficulty, 
      candidateName,
      candidateEmail,
      host: userId, 
      callId 
    });

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({ 
      status: "active",
      $or: [{ host: userId }, { participant: userId }, { candidateEmail: req.user.email }]
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }, { candidateEmail: req.user.email }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId")
      .populate("waitingParticipant", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // check if session is already full - has a participant
    if (session.participant) return res.status(409).json({ message: "Session is full" });

    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const { finalCode, finalLanguage } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // mark as completed first so DB updates correctly
    session.status = "completed";
    if (finalCode !== undefined) session.finalCode = finalCode;
    if (finalLanguage) session.finalLanguage = finalLanguage;
    await session.save();

    try {
      // delete stream video call
      const call = streamClient.video.call("default", session.callId);
      await call.delete();

      // delete stream chat channel
      const channel = chatClient.channel("messaging", session.callId);
      await channel.delete();
    } catch (streamError) {
      console.log("Error cleaning up stream (ignoring):", streamError);
    }

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error);
    res.status(500).json({ message: "Failed to end session", error: error.message || error.toString() });
  }
}

export async function updateSessionProblem(req, res) {
  try {
    const { id } = req.params;
    const { problem, difficulty } = req.body;
    const userId = req.user._id;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can change the problem" });
    }

    session.problem = problem;
    session.difficulty = difficulty;
    await session.save();

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in updateSessionProblem controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateSessionNotes(req, res) {
  try {
    const { id } = req.params;
    const { evaluationNotes } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can add notes" });
    }

    session.evaluationNotes = evaluationNotes || "";
    await session.save();

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in updateSessionNotes controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function askToJoin(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host does not need to ask to join" });
    }

    if (session.participant) return res.status(409).json({ message: "Session is full" });

    session.waitingParticipant = userId;
    await session.save();

    res.status(200).json({ session, message: "Host has been notified. Waiting for admission." });
  } catch (error) {
    console.log("Error in askToJoin controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function admitParticipant(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id; // must be host

    const session = await Session.findById(id).populate("waitingParticipant");

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can admit participants" });
    }

    if (!session.waitingParticipant) {
      return res.status(400).json({ message: "No one is waiting" });
    }

    // Add them to the session
    const participantId = session.waitingParticipant._id;
    const clerkId = session.waitingParticipant.clerkId;
    
    session.participant = participantId;
    session.waitingParticipant = null;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session, message: "Participant admitted" });
  } catch (error) {
    console.log("Error in admitParticipant controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function denyParticipant(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can deny participants" });
    }

    session.waitingParticipant = null;
    await session.save();

    res.status(200).json({ session, message: "Participant denied" });
  } catch (error) {
    console.log("Error in denyParticipant controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
