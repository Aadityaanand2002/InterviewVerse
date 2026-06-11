import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getProblems, getProblemById, createProblem, updateProblem, deleteProblem } from "../controllers/problemController.js";

const router = express.Router();

// Public route to get all problems
router.get("/", getProblems);
router.get("/:id", getProblemById);

// Admin routes (basic protection, can be extended to check roles later)
router.post("/", protectRoute, createProblem);
router.put("/:id", protectRoute, updateProblem);
router.delete("/:id", protectRoute, deleteProblem);

export default router;
