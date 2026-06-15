import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import { inngest } from "../lib/inngest.js";
import nodemailer from "nodemailer";

export async function createSession(req, res) {
  try {
    const { problem, difficulty, candidateName, candidateEmail, scheduledAt, maxParticipants } = req.body;
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
      callId,
      status: scheduledAt ? "scheduled" : "active",
      scheduledAt: scheduledAt || null,
      startedAt: scheduledAt ? null : new Date(),
      maxParticipants: maxParticipants || 2
    });

    const inviteLink = `${process.env.CLIENT_URL}/session/${session._id.toString()}`;
    const scheduledText = scheduledAt ? `The interview is scheduled for ${new Date(scheduledAt).toLocaleString()}.` : `The interview is ready to start right now.`;
    try {
      let transporter;
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
      }

      await transporter.sendMail({
        from: '"InterviewVerse" <no-reply@interviewverse.com>',
        to: candidateEmail,
        subject: `Interview Invitation: ${problem} with ${req.user.name}`,
        text: `Hello ${candidateName},\n\nYou have been invited to an interview for the problem: ${problem}.\n${scheduledText}\n\nPlease join the room using this link: ${inviteLink}\n\nGood luck!\nInterviewVerse Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; padding: 20px;">
            <h2>Interview Invitation 🚀</h2>
            <p>Hello <strong>${candidateName}</strong>,</p>
            <p>You have been invited to an interview for the problem: <strong>${problem}</strong>.</p>
            <p><strong>Time:</strong> ${scheduledAt ? new Date(scheduledAt).toLocaleString() : "Right Now"}</p>
            <p><strong>Interviewer:</strong> ${req.user.name}</p>
            <div style="margin-top: 20px;">
              <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Interview Room</a>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError.message);
    }

    if (scheduledAt) {
      try {
        await inngest.send({
          name: "session/scheduled",
          data: {
            sessionId: session._id.toString(),
            scheduledAt,
            candidateName,
            candidateEmail,
            hostName: req.user.name,
            problem
          }
        });
      } catch (inngestError) {
        console.error("Failed to schedule via Inngest:", inngestError.message);
      }
    }

    try {
      await streamClient.video.call("default", callId).getOrCreate({
        data: {
          created_by_id: clerkId,
          custom: { problem, difficulty, sessionId: session._id.toString() },
        },
      });

      const channel = chatClient.channel("messaging", callId, {
        name: `${problem} Session`,
        created_by_id: clerkId,
        members: [clerkId],
      });
      await channel.create();
    } catch (streamError) {
      console.error("Failed to initialize Stream services:", streamError.message);
    }

    res.status(201).json({ session });
  } catch (error) {
    console.error("Error in createSession controller:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function getActiveSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({ 
      status: { $in: ["active", "scheduled"] },
      $or: [{ host: userId }, { participant: userId }, { participants: userId }, { candidateEmail: req.user.email }]
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .populate("participants", "name profileImage email clerkId")
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
      $or: [{ host: userId }, { participant: userId }, { participants: userId }, { candidateEmail: req.user.email }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .populate("participants", "name profileImage email clerkId")
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
      .populate("participants", "name email profileImage clerkId")
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

    if (session.status !== "active" && session.status !== "scheduled") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    // Wait! If it's scheduled, the host shouldn't join as participant anyway.
    // If a candidate tries to join a scheduled session, the frontend will block them until it's active.
    // We can allow them to "join" but the frontend displays a waiting room.

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // check if session is already full
    if ((session.participants?.length || 0) + 1 >= (session.maxParticipants || 2)) {
      return res.status(409).json({ message: "Session is full" });
    }

    if (!session.participant) {
      session.participant = userId;
    }
    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
    }
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

export async function updateSessionScore(req, res) {
  try {
    const { id } = req.params;
    const { candidateScore, metrics, overallRating, sharedWithCandidate } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can score the session" });
    }

    if (metrics !== undefined) session.metrics = { ...session.metrics, ...metrics };
    if (candidateScore !== undefined) session.metrics.communication = candidateScore; // Fallback or backward compat
    if (overallRating !== undefined) session.overallRating = overallRating;
    if (sharedWithCandidate !== undefined) session.sharedWithCandidate = sharedWithCandidate;

    await session.save();

    res.status(200).json({ session, message: "Score updated successfully" });
  } catch (error) {
    console.log("Error in updateSessionScore controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function addTimelineEvent(req, res) {
  try {
    const { id } = req.params;
    const { type, message } = req.body;
    
    if (!type || !message) {
      return res.status(400).json({ message: "Type and message are required" });
    }

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    session.timeline.push({ type, message });
    await session.save();

    res.status(200).json({ message: "Timeline event added successfully", timeline: session.timeline });
  } catch (error) {
    console.log("Error in addTimelineEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function addCodeSnapshot(req, res) {
  try {
    const { id } = req.params;
    const { code, language, output } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" });
    }

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    session.codeSnapshots.push({ code, language, output });
    await session.save();

    res.status(200).json({ message: "Code snapshot added successfully" });
  } catch (error) {
    console.log("Error in addCodeSnapshot controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
