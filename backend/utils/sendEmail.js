const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'b46716070@gmail.com',        
    pass: 'hkzw huev rcjv zzvm',           
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: '"MoodApp 🎵" <b46716070@gmail.com>',
      to,
      subject,
      html,
    });
    console.log('Email sent to', to);
  } catch (error) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
