import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";
dotenv.config();
async function run() {
  const user = await clerkClient.users.getUser("user_3EwczNvb8cOcJhAM4zu8AhpF5VG");
  console.log(user);
}
run();
