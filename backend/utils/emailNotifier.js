const nodemailer = require('nodemailer');
require('dotenv').config();

const getStatusColor = (status) => {
  switch (status) {
    case 'Resolved': return '#10b981';
    case 'In Progress': return '#3b82f6';
    case 'Pending': return '#f59e0b';
    default: return '#6b7280';
  }
};

const sendTicketUpdateEmail = async (ticket) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    const statusColor = getStatusColor(ticket.status);

    await transporter.sendMail({
      from: `"UniHub Support" <${process.env.GMAIL_USER}>`,
      to: ticket.email,
      subject: `[UniHub] Your Ticket Has Been Updated – ${ticket.subject}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 40px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;">UniHub</h1>
      <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px;">Support Ticket System</p>
    </div>
    <div style="padding:40px;">
      <h2 style="color:#1e293b;margin:0 0 8px;font-size:20px;">Hi ${ticket.name},</h2>
      <p style="color:#64748b;margin:0 0 28px;font-size:15px;line-height:1.6;">
        Your support ticket has been reviewed and updated by our team.
      </p>
      <div style="text-align:center;margin-bottom:28px;">
        <span style="display:inline-block;background:${statusColor};color:#fff;padding:8px 24px;border-radius:999px;font-size:14px;font-weight:700;">
          Status: ${ticket.status}
        </span>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#94a3b8;font-weight:700;letter-spacing:1px;">Ticket Subject</p>
        <p style="margin:0 0 20px;font-size:16px;font-weight:700;color:#1e293b;">${ticket.subject}</p>
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#94a3b8;font-weight:700;letter-spacing:1px;">Your Message</p>
        <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;white-space:pre-wrap;">${ticket.message}</p>
        <hr style="border:0;border-top:1px solid #e2e8f0;margin:0 0 20px;">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;color:#94a3b8;font-weight:700;letter-spacing:1px;">Admin Response</p>
        <p style="margin:0;font-size:15px;color:#1e293b;line-height:1.7;white-space:pre-wrap;font-weight:500;">${ticket.response || 'No response provided yet.'}</p>
      </div>
      <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
        If you have further questions, please submit a new ticket on the UniHub portal.
      </p>
    </div>
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} UniHub · Smart Campus System</p>
      <p style="margin:4px 0 0;color:#cbd5e1;font-size:11px;">Ticket ID: #${ticket._id}</p>
    </div>
  </div>
</body>
</html>`,
    });

    console.log('📧 Ticket update email sent to:', ticket.email);
  } catch (error) {
    console.error('❌ Failed to send ticket update email:', error.message);
  }
};

module.exports = { sendTicketUpdateEmail };