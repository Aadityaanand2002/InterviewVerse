import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { importFromLeetcode, importFromGithub } from "../controllers/importController.js";

const router = express.Router();

router.post("/leetcode", protectRoute, importFromLeetcode);
router.post("/github", protectRoute, importFromGithub);

export default router;
