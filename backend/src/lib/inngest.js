import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";
import Session from "../models/Session.js";
import nodemailer from "nodemailer";

export const inngest = new Inngest({ id: "interviewverse", isDev: true });

const syncUser = inngest.createFunction(
  { id: "sync-user", event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      profileImage: image_url,
    };

    await User.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db", event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

const handleScheduledSession = inngest.createFunction(
  { id: "handle-scheduled-session", event: "session/scheduled" },
  async ({ event, step }) => {
    const { sessionId, scheduledAt, candidateName, candidateEmail, hostName, problem } = event.data;

    // Email is now sent directly in the controller to guarantee delivery


    // Step 2: Sleep until the scheduled time
    await step.sleepUntil("wait-for-interview", new Date(scheduledAt));

    // Step 3: Activate the room
    await step.run("activate-room", async () => {
      await connectDB();
      const session = await Session.findById(sessionId);
      if (session && session.status === "scheduled") {
        session.status = "active";
        await session.save();
        console.log(`Session ${sessionId} is now ACTIVE!`);
      }
    });
  }
);

export const functions = [syncUser, deleteUserFromDB, handleScheduledSession];
