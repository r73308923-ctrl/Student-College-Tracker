import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

export async function sendPasswordResetEmail(email: string, otp: string) {
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    body: {
      from: process.env.ATTENDEX_EMAIL_FROM ?? "Attendex Tracker <onboarding@resend.dev>",
      to: [email],
      subject: "Your Attendex Tracker reset code",
      text: `Your Attendex Tracker password reset code is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#183b3b"><h2>Reset your Attendex Tracker password</h2><p>Use this code to continue:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${otp}</p><p>This code expires in 10 minutes. If you did not request a reset, you can ignore this email.</p></div>`,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend rejected password reset email (${response.status}): ${details.slice(0, 300)}`);
  }
}