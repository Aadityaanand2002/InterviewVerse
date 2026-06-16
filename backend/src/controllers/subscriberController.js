import nodemailer from "nodemailer";
import Subscriber from "../models/Subscriber.js";

// Reusable account transporter
let mailTransporter = null;

const getTransporter = async () => {
  if (mailTransporter) return mailTransporter;

  // Use Real Gmail if configured in .env
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("Using Real Gmail SMTP to send emails.");
    return mailTransporter;
  }

  // Fallback: Generate test SMTP service account from ethereal.email if no .env config
  console.log("No SMTP_USER found in .env. Falling back to Ethereal Test Account.");
  let testAccount = await nodemailer.createTestAccount();

  mailTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return mailTransporter;
};

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: "You are already subscribed!" });
    }

    // Create new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    // Send Welcome Email
    try {
      const transporter = await getTransporter();

      let info = await transporter.sendMail({
        from: '"InterviewVerse Team" <hello@interviewverse.com>',
        to: email,
        subject: "Welcome to InterviewVerse! 🎉",
        text: "Hi there! Thank you for subscribing to InterviewVerse updates. We're excited to have you on board.",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0f18; color: #e5e7eb; padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #374151; border-radius: 12px; padding: 40px 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              
              <div style="margin-bottom: 30px; font-family: 'Arial', sans-serif;">
                <span style="color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-shadow: 0 0 8px rgba(255,255,255,0.4);">Interview</span><span style="color: #22d3ee; font-size: 32px; font-weight: 700; letter-spacing: 0px; text-shadow: 0 0 8px rgba(34,211,238,0.5);">Verse</span>
              </div>

              <h2 style="color: #f3f4f6; margin-bottom: 20px; font-size: 22px;">Welcome to InterviewVerse! 🚀</h2>
              
              <p style="font-size: 16px; color: #d1d5db; line-height: 1.6; text-align: left;">
                Thank you for subscribing to our newsletter! We're excited to have you on board.
              </p>
              
              <div style="background-color: #1f2937; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
                <p style="margin: 0; color: #9ca3af; font-size: 15px; line-height: 1.5;">
                  We'll keep you updated with the latest platform features, interview tips, and engineering hiring insights straight to your inbox.
                </p>
              </div>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #374151; font-size: 13px; color: #6b7280;">
                <p>&copy; ${new Date().getFullYear()} InterviewVerse. All rights reserved.</p>
                <p>You received this email because you subscribed on our website.</p>
              </div>

            </div>
          </div>
        `,
      });

      console.log("-----------------------------------------");
      console.log("Newsletter Subscription Email Sent!");
      console.log("To:", email);
      
      // Only print ethereal URL if using fallback test account
      if (!process.env.SMTP_USER) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
      console.log("-----------------------------------------");
      
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // We don't fail the request if email sending fails, as long as it's saved to DB
    }

    res.status(201).json({ message: "Successfully subscribed!" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
