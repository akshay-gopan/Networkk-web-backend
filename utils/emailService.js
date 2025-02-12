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

const sendServiceRejectionEmail = async (providerEmail, serviceName, rejectionReason = '') => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: providerEmail,
    subject: 'Service Status Update - Rejected',
    html: `
      <h1>Service Status Update</h1>
      <p>We regret to inform you that your service "${serviceName}" has been Rejected at this time.</p>
      ${rejectionReason ? `<p>Reason: ${rejectionReason}</p>` : ''}
      <p>If you would like to submit a revised service proposal or have any questions, please don't hesitate to contact us.</p>
      <br>
      <p>Best regards,</p>
      <p>The Networkk Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Rejection email sent successfully');
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
};

module.exports = {
  sendServiceApprovalEmail,
  sendServiceRejectionEmail
};