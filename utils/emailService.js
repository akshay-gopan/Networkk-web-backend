const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',  // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendServiceApprovalEmail = async (providerEmail, serviceName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: providerEmail,
    subject: 'Your Service Has Been Approved',
    html: `
      <h1>Service Approval Notification</h1>
      <p>Congratulations! Your service "${serviceName}" has been approved by our admin team.</p>
      <p>Your service is now visible to customers on our platform.</p>
      <br>
      <p>Best regards,</p>
      <p>The Networkk Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Approval email sent successfully');
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

module.exports = {
  sendServiceApprovalEmail
};