const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  // ✅ Use real SMTP (Gmail or others) if provided
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('✅ Using SMTP email service');
  } else {
    // 🧪 Fallback to Ethereal (testing)
    console.log('⚠️ No SMTP config found. Using Ethereal test email...');

    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
};

const sendTicketUpdateEmail = async (ticket) => {
  try {
    const tp = await createTransporter();

    const info = await tp.sendMail({
      from: '"UniHub Support" <support@unihub.edu>',
      to: ticket.email,
      subject: `Support Ticket Updated: ${ticket.subject}`,
      text: `Hello ${ticket.name},

Your support ticket (${ticket._id}) has been updated.

Status: ${ticket.status}

Response:
${ticket.response || 'No response provided.'}

Thank you,
UniHub Support`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #4f46e5;">Hello ${ticket.name},</h2>
          <p>Your support ticket (<strong>#${ticket._id}</strong>) has been updated by a UniHub administrator.</p>

          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p><strong>Status:</strong> ${ticket.status}</p>
            <p><strong>Admin Response:</strong></p>
            <p style="white-space: pre-wrap;">${ticket.response || '<em>No response provided.</em>'}</p>
          </div>

          <p>Thank you,<br/><strong>UniHub Support Team</strong></p>
        </div>
      `,
    });

    // ✅ Logs
    console.log('[Email Dispatched] Ticket updated notification sent successfully!');
    console.log('Message ID:', info.messageId);

    // ✅ Correct Preview URL handling (FIXED)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('📧 Preview URL:', previewUrl);
    } else {
      console.log('📩 Real email sent to:', ticket.email);
    }

  } catch (error) {
    console.error('❌ Failed to send ticket update email:', error);
  }
};

module.exports = {
  sendTicketUpdateEmail,
};