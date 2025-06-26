const nodemailer = require('nodemailer');

// Email configuration with best practices for deliverability
const emailConfig = {
  // SendGrid configuration (recommended for transactional emails)
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: 2525,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.EMAIL_PASS
    },
    // Additional settings for better deliverability
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14, // SendGrid allows 14 emails per second
    // Headers for better deliverability
    headers: {
      'X-SMTPAPI': JSON.stringify({
        filters: {
          clicktrack: { settings: { enable: 0 } },
          opentrack: { settings: { enable: 0 } }
        }
      })
    }
  },

  // Gmail configuration (fallback)
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },

  // Common email settings
  defaults: {
    from: {
      name: 'Kings Invest',
      address: process.env.EMAIL_USER || 'noreply@kingsinvest.com'
    },
    replyTo: 'support@kingsinvest.com',
    // Headers to improve deliverability
    headers: {
      'List-Unsubscribe': '<mailto:unsubscribe@kingsinvest.com>',
      'Precedence': 'bulk',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      'X-Mailer': 'Kings Invest Platform'
    }
  }
};

// Create transporter based on configuration
const createTransporter = () => {
  const apiKey = process.env.EMAIL_PASS?.replace(/%$/, ''); // Remove trailing %
  
  if (!apiKey) {
    console.error('❌ Email configuration error: Missing API key');
    return null;
  }

  // Prefer SendGrid for better deliverability
  if (process.env.EMAIL_HOST === 'smtp.sendgrid.net' || process.env.EMAIL_SERVICE === 'sendgrid') {
    console.log('🔧 Using SendGrid configuration for better deliverability...');
    return nodemailer.createTransport(emailConfig.sendgrid);
  }

  // Fallback to Gmail
  if (process.env.EMAIL_USER) {
    console.log('🔧 Using Gmail configuration...');
    return nodemailer.createTransport(emailConfig.gmail);
  }

  console.error('❌ Email configuration error: No valid email service configured');
  return null;
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return false;
    }

    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

// Send email with proper error handling and logging
const sendEmail = async (to, subject, htmlContent, textContent = null) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const mailOptions = {
      ...emailConfig.defaults,
      to,
      subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML if no text provided
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createTransporter,
  verifyEmailConfig,
  sendEmail,
  emailConfig
}; 