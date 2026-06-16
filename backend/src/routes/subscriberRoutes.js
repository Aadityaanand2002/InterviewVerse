import express from "express";
import { subscribeNewsletter } from "../controllers/subscriberController.js";

const router = express.Router();

// POST /api/subscribers/subscribe
router.post("/subscribe", subscribeNewsletter);

export default router;
