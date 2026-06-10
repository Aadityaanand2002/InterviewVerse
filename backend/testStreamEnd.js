import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";
import dotenv from "dotenv";
dotenv.config();

const streamClient = new StreamClient(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET, { timeout: 3000 });

async function run() {
  try {
    const callId = "test_call_" + Date.now();
    const call = streamClient.video.call("default", callId);
    await call.getOrCreate({ data: { created_by_id: "user_1" } });
    
    // try to end/delete
    console.log("Ending call...");
    try {
        await call.endCall();
        console.log("Ended using endCall()");
    } catch(e) {
        console.log("endCall failed:", e.message);
        try {
           await call.delete();
           console.log("Deleted using delete()");
        } catch(e2) {
           console.log("delete failed:", e2.message);
        }
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
}
run();
