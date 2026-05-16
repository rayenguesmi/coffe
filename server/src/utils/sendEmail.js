const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s+/g, ''),
    },
  });

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"QuickCafe" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.CLIENT_ORIGIN}/admin/reset-password/${token}`;
  await sendEmail({
    to,
    subject: 'Reset your QuickCafe password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#6B4F2A;">Reset Your Password</h2>
        <p>Click the button below to choose a new password.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#D4A853;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#999;font-size:12px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendPasswordResetEmail };
