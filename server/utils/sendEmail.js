const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInviteEmail = async (to, inviterName, projectName, token) => {
  const inviteLink = `${process.env.CLIENT_URL}/invite/${token}`;

  await transporter.sendMail({
    from: `"Orbit" <${process.env.EMAIL_USER}>`,
    to,
    subject: `You've been invited to join ${projectName} on Orbit`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>You've been invited!</h2>
        <p><strong>${inviterName}</strong> invited you to join <strong>${projectName}</strong> on Orbit.</p>
        <a href="${inviteLink}" style="
          display: inline-block;
          padding: 12px 24px;
          background: #6366f1;
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 16px;
        ">Accept Invitation</a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          This link expires in 24 hours.
        </p>
      </div>
    `,
  });
};

module.exports = { sendInviteEmail };