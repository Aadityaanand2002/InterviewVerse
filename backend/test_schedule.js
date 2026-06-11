import { Inngest } from "inngest";
const inngest = new Inngest({ id: "interviewverse", eventKey: "local" });

async function trigger() {
  try {
    await inngest.send({
      name: "session/scheduled",
      data: {
        sessionId: "60d5ecb8b392cb2410a8d8e9", // dummy objectId
        scheduledAt: new Date(Date.now() + 60000).toISOString(), // 1 min from now
        candidateName: "Eshan",
        candidateEmail: "eshanrio1@gmail.com",
        hostName: "Aditya Anand",
        problem: "To be assigned"
      }
    });
    console.log("Scheduled event sent successfully!");
  } catch (error) {
    console.error("Error sending event:", error);
  }
}

trigger();
