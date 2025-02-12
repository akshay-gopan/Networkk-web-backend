// emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Send approval email to service provider
  async sendServiceApprovalEmail() {
    try {
      const mailOptions = {
        from: `akshaygopan73@gmail.com`,
        to: `percythomas00@gmail.com`,
        subject: 'Service Approval Notification',
        html: `
          <h1>Service Approved</h1>
          <p>Dear Percy,</p>
          <p>We are pleased to inform you that your service has been approved.</p>
          <p>You can now start accepting booking requests through our platform.</p>
          <p>Best regards,<br>Admin Team</p>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Approval email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending approval email:', error);
      throw new Error('Failed to send approval email');
    }
  }

  // Send booking confirmation email to user
  async sendBookingConfirmationEmail(booking) {
    try {
      const mailOptions = {
        from: `"Service Provider" <${process.env.SMTP_USER}>`,
        to: booking.userEmail,
        subject: 'Booking Request Accepted',
        html: `
          <h1>Booking Confirmed</h1>
          <p>Dear ${booking.userName},</p>
          <p>Your booking request for "${booking.serviceName}" has been accepted.</p>
          <p>Booking Details:</p>
          <ul>
            <li>Service: ${booking.serviceName}</li>
            <li>Date: ${new Date(booking.date).toLocaleDateString()}</li>
            <li>Time: ${booking.time}</li>
            <li>Provider: ${booking.providerName}</li>
          </ul>
          <p>If you need to make any changes, please contact us through the platform.</p>
          <p>Best regards,<br>${booking.providerName}</p>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      throw new Error('Failed to send booking confirmation email');
    }
  }

  // Verify email configuration
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();