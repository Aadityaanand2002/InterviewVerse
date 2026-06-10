import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Session from "./src/models/Session.js";

mongoose.connect(process.env.DB_URL);

async function check() {
  const sessions = await Session.find({});
  for (let s of sessions) {
    console.log(`Session ${s._id} | Problem: ${s.problem} | Status: ${s.status}`);
  }
  process.exit(0);
}
check();
