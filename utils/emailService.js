// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',  // or your email service
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// const sendServiceApprovalEmail = async (providerEmail, serviceName) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: providerEmail,
//     subject: 'Your Service Has Been Approved',
//     html: `
//       <h1>Service Approval Notification</h1>
//       <p>Congratulations! Your service "${serviceName}" has been approved by our admin team.</p>
//       <p>Your service is now visible to customers on our platform.</p>
//       <br>
//       <p>Best regards,</p>
//       <p>The Networkk Team</p>
//     `
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Approval email sent successfully');
//   } catch (error) {
//     console.error('Error sending approval email:', error);
//     throw error;
//   }
// };

// const sendServiceRejectionEmail = async (providerEmail, serviceName, rejectionReason = '') => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: providerEmail,
//     subject: 'Service Status Update - Rejected',
//     html: `
//       <h1>Service Status Update</h1>
//       <p>We regret to inform you that your service "${serviceName}" has been Rejected at this time.</p>
//       ${rejectionReason ? `<p>Reason: ${rejectionReason}</p>` : ''}
//       <p>If you would like to submit a revised service proposal or have any questions, please don't hesitate to contact us.</p>
//       <br>
//       <p>Best regards,</p>
//       <p>The Networkk Team</p>
//     `
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Rejection email sent successfully');
//   } catch (error) {
//     console.error('Error sending rejection email:', error);
//     throw error;
//   }
// };

// const sendBookingNotificationEmail = async (providerEmail, bookingDetails) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: providerEmail,
//     subject: `New Booking Notification - ${bookingDetails.bookingId}`,
//     html: `
//       <h1>New Booking Received</h1>
//       <p>You have received a new booking request!</p>
      
//       <div style="margin: 20px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
//         <h2>Booking Details:</h2>
//         <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
//         <p><strong>Date:</strong> ${bookingDetails.bookingDate}</p>
//         <p><strong>Time:</strong> ${bookingDetails.bookingTime}</p>
//         <p><strong>Base Payment:</strong> Rs. ${bookingDetails.basePayment}</p>
        
//         <h3>Service Information:</h3>
//         <p><strong>Service ID:</strong> ${bookingDetails.service.id}</p>
//         <p><strong>Service Title:</strong> ${bookingDetails.service.title}</p>
//         <p><strong>Category:</strong> ${bookingDetails.service.category}</p>
        
//         <h3>Customer Information:</h3>
//         <p><strong>Customer ID:</strong> ${bookingDetails.user.id}</p>
//         <p><strong>Name:</strong> ${bookingDetails.user.name}</p>
//         <p><strong>Phone:</strong> ${bookingDetails.user.phone}</p>
//         <p><strong>Address:</strong> ${bookingDetails.user.address}</p>
        
//         <h3>Additional Information:</h3>
//         <p><strong>Description:</strong> ${bookingDetails.description}</p>
//       </div>

//       <p>Please log in to your dashboard to manage this booking.</p>
//       <br>
//       <p>Best regards,</p>
//       <p>The Networkk Team</p>
//     `
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Booking notification email sent successfully');
//   } catch (error) {
//     console.error('Error sending booking notification email:', error);
//     throw error;
//   }
// };

// module.exports = {
//   sendServiceApprovalEmail,
//   sendServiceRejectionEmail,
//   sendBookingNotificationEmail
// };

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',  // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Common email template with consistent styling
const emailTemplate = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: #4a90e2;
        padding: 20px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      .logo {
        font-family: 'Arial', sans-serif;
        font-size: 32px;
        font-weight: bold;
        color: white;
        letter-spacing: 1px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
      }
      .content {
        background-color: #ffffff;
        padding: 30px;
        border-left: 1px solid #e0e0e0;
        border-right: 1px solid #e0e0e0;
      }
      .footer {
        background-color: #f5f5f5;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #666666;
        border-radius: 0 0 8px 8px;
        border: 1px solid #e0e0e0;
      }
      h1 {
        color: #4a90e2;
        margin-top: 0;
        font-size: 24px;
      }
      h2 {
        color: #4a90e2;
        font-size: 20px;
        margin-top: 20px;
      }
      .info-box {
        background-color: #f9f9f9;
        border-left: 4px solid #4a90e2;
        padding: 15px;
        margin: 20px 0;
        border-radius: 0 4px 4px 0;
      }
      .btn {
        display: inline-block;
        background-color: #4a90e2;
        color: white;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 4px;
        margin: 20px 0;
        font-weight: bold;
      }
      .social-links {
        margin-top: 15px;
      }
      .social-links a {
        display: inline-block;
        margin: 0 10px;
        color: #4a90e2;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Networkk</div>
        <p>Connecting You to the Best Services</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Networkk. All rights reserved.</p>
        <div class="social-links">
          <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
        </div>
        <p>If you have any questions, contact our support team at support@networkk.com</p>
      </div>
    </div>
  </body>
  </html>
`;

const sendServiceApprovalEmail = async (providerEmail, serviceName) => {
  const content = `
    <h1>Service Approval Notification</h1>
    <p>Congratulations! Your service <strong>"${serviceName}"</strong> has been approved by our admin team.</p>
    <div class="info-box">
      <p>Your service is now visible to customers on our platform and ready to receive bookings.</p>
    </div>
    <p>You can now access and manage your service through your provider dashboard.</p>
    <a href="${process.env.DASHBOARD_URL || 'https://networkk.com/dashboard'}" class="btn">Go to Dashboard</a>
    <p>Thank you for being a valued service provider on Networkk!</p>
    <p>Best regards,<br>The Networkk Team</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: providerEmail,
    subject: 'Your Service Has Been Approved',
    html: emailTemplate(content)
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
  const content = `
    <h1>Service Status Update</h1>
    <p>We regret to inform you that your service <strong>"${serviceName}"</strong> has been rejected at this time.</p>
    ${rejectionReason ? `
    <div class="info-box">
      <p><strong>Reason:</strong> ${rejectionReason}</p>
    </div>` : ''}
    <p>If you would like to submit a revised service proposal or have any questions, please don't hesitate to contact us.</p>
    <a href="${process.env.SUPPORT_URL || 'https://networkk.com/support'}" class="btn">Contact Support</a>
    <p>We appreciate your understanding and look forward to working with you in the future.</p>
    <p>Best regards,<br>The Networkk Team</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: providerEmail,
    subject: 'Service Status Update - Rejected',
    html: emailTemplate(content)
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
  const content = `
    <h1>New Booking Received</h1>
    <p>You have received a new booking request!</p>
    
    <div class="info-box">
      <h2>Booking Details</h2>
      <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
      <p><strong>Date:</strong> ${bookingDetails.bookingDate}</p>
      <p><strong>Time:</strong> ${bookingDetails.bookingTime}</p>
      <p><strong>Base Payment:</strong> Rs. ${bookingDetails.basePayment}</p>
    </div>
    
    <div class="info-box">
      <h2>Service Information</h2>
      <p><strong>Service ID:</strong> ${bookingDetails.service.id}</p>
      <p><strong>Service Title:</strong> ${bookingDetails.service.title}</p>
      <p><strong>Category:</strong> ${bookingDetails.service.category}</p>
    </div>
    
    <div class="info-box">
      <h2>Customer Information</h2>
      <p><strong>Customer ID:</strong> ${bookingDetails.user.id}</p>
      <p><strong>Name:</strong> ${bookingDetails.user.name}</p>
      <p><strong>Phone:</strong> ${bookingDetails.user.phone}</p>
      <p><strong>Address:</strong> ${bookingDetails.user.address}</p>
    </div>
    
    <div class="info-box">
      <h2>Additional Information</h2>
      <p><strong>Description:</strong> ${bookingDetails.description || 'No additional description provided'}</p>
    </div>

    <p>Please log in to your dashboard to manage this booking.</p>
    <hr>
    <p>Best regards,<br>The Networkk Team</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: providerEmail,
    subject: `New Booking Notification - ${bookingDetails.bookingId}`,
    html: emailTemplate(content)
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