import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { getProblems, getProblemById, createProblem, updateProblem, deleteProblem } from "../controllers/problemController.js";

const router = express.Router();

// Public route to get all problems
router.get("/", getProblems);
router.get("/:id", getProblemById);

// Admin-only routes — must be authenticated AND have role === "admin"
router.post("/", protectRoute, requireAdmin, createProblem);
router.put("/:id", protectRoute, requireAdmin, updateProblem);
router.delete("/:id", protectRoute, requireAdmin, deleteProblem);

export default router;
