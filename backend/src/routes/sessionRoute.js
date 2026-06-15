import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
  updateSessionProblem,
  updateSessionNotes,
  updateSessionScore,
  askToJoin,
  admitParticipant,
  denyParticipant,
  addTimelineEvent,
  addCodeSnapshot,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);

router.post("/:id/ask", protectRoute, askToJoin);
router.post("/:id/admit", protectRoute, admitParticipant);
router.post("/:id/deny", protectRoute, denyParticipant);

router.put("/:id/problem", protectRoute, updateSessionProblem);
router.put("/:id/notes", protectRoute, updateSessionNotes);
router.put("/:id/score", protectRoute, updateSessionScore);

router.post("/:id/timeline", protectRoute, addTimelineEvent);
router.post("/:id/snapshot", protectRoute, addCodeSnapshot);

export default router;
