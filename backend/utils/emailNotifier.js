const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  // Use provided SMTP credentials if available
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to testing (Ethereal) email 
    console.log('No SMTP config found. Generating ethereal testing account for dev environment...');
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
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
      text: `Hello ${ticket.name},\n\nYour support ticket (${ticket._id}) has been updated.\n\nStatus: ${ticket.status}\n\nResponse:\n${ticket.response || 'No response provided.'}\n\nThank you,\nUniHub Support`, 
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #4f46e5;">Hello ${ticket.name},</h2>
          <p>Your support ticket (<strong>#${ticket._id}</strong>) has been updated by a UniHub administrator.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p><strong>Status:</strong> <span style="background: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; border: 1px solid #cbd5e1;">${ticket.status}</span></p>
            <p><strong>Admin Response:</strong></p>
            <p style="white-space: pre-wrap; color: #334155;">${ticket.response || '<em>No response provided.</em>'}</p>
          </div>
          <p>Thank you,<br/><strong>UniHub Support Team</strong></p>
        </div>
      `,
    });

    console.log(`[Email Dispatched] Ticket updated notification sent successfully! Message ID: ${info.messageId}`);
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log(`[Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }

  } catch (error) {
    console.error('Failed to send ticket update email:', error);
  }
};

module.exports = {
  sendTicketUpdateEmail,
};
