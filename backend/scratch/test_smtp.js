const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
  console.log('Using User:', process.env.GMAIL_USER);
  console.log('Using Pass:', process.env.GMAIL_APP_PASS ? '********' : 'MISSING');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"UniHub Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: 'UniHub SMTP Test',
      text: 'If you see this, SMTP is working!',
      html: '<b>If you see this, SMTP is working!</b>'
    });
    console.log('Test Email Sent: %s', info.messageId);
  } catch (error) {
    console.error('SMTP Test Failed:', error);
  }
};

testEmail();
