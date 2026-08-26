import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to: string, code: string) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "no-reply@gmail.com",
    to,
    subject: "Your verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Verify your email</h2>
        <p>Use the code below to verify your email address. It expires in 10 minutes.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
};
