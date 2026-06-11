import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function send() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"InterviewVerse" <no-reply@interviewverse.com>',
      to: "eshanrio1@gmail.com",
      subject: "Test Mail",
      text: "This is a test mail from the script.",
    });

    console.log("Real email sent! Message ID:", info.messageId);
  } catch(e) {
    console.error("Failed to send email:", e.message);
  }
}
send();
