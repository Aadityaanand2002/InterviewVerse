import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// GET /api/users/me - returns current user's profile including role
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
