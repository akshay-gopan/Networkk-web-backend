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

const sendBookingNotificationEmail = async (providerEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: providerEmail,
    subject: `New Booking Notification - ${bookingDetails.bookingId}`,
    html: `
      <h1>New Booking Received</h1>
      <p>You have received a new booking request!</p>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
        <h2>Booking Details:</h2>
        <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
        <p><strong>Date:</strong> ${bookingDetails.bookingDate}</p>
        <p><strong>Time:</strong> ${bookingDetails.bookingTime}</p>
        <p><strong>Base Payment:</strong> Rs. ${bookingDetails.basePayment}</p>
        
        <h3>Service Information:</h3>
        <p><strong>Service ID:</strong> ${bookingDetails.service.id}</p>
        <p><strong>Service Title:</strong> ${bookingDetails.service.title}</p>
        <p><strong>Category:</strong> ${bookingDetails.service.category}</p>
        
        <h3>Customer Information:</h3>
        <p><strong>Customer ID:</strong> ${bookingDetails.user.id}</p>
        <p><strong>Name:</strong> ${bookingDetails.user.name}</p>
        <p><strong>Phone:</strong> ${bookingDetails.user.phone}</p>
        <p><strong>Address:</strong> ${bookingDetails.user.address}</p>
        
        <h3>Additional Information:</h3>
        <p><strong>Description:</strong> ${bookingDetails.description}</p>
      </div>

      <p>Please log in to your dashboard to manage this booking.</p>
      <br>
      <p>Best regards,</p>
      <p>The Networkk Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking notification email sent successfully');
  } catch (error) {
    console.error('Error sending booking notification email:', error);
    throw error;
  }
};

module.exports = {
  sendServiceApprovalEmail,
  sendServiceRejectionEmail,
  sendBookingNotificationEmail
};