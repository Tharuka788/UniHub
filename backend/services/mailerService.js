const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // For local testing/demonstration, we recommend using Ethereal Email 
  // or a Gmail App Password in production.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
      user: process.env.EMAIL_USER || 'mock-user@ethereal.email',
      pass: process.env.EMAIL_PASS || 'mock-password'
    }
  });

  const mailOptions = {
    from: `"UniHub Support" <support@unihub.com>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: %s', info.messageId);
  return info;
};

module.exports = { sendEmail };
