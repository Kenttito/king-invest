const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Generate verification code
function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString();
}

// Create email transporter with SendGrid
function createTransporter() {
  // Clean up the API key (remove any trailing characters)
  let apiKey = process.env.EMAIL_PASS;
  if (apiKey && apiKey.endsWith('%')) {
    apiKey = apiKey.slice(0, -1);
  }

  const emailConfig = {
    host: 'smtp.sendgrid.net',
    port: 2525,
    secure: false,
    auth: {
      user: 'apikey',  // Always 'apikey' for SendGrid
      pass: apiKey
    }
  };

  console.log('Email configuration:', {
    host: emailConfig.host,
    port: emailConfig.port,
    user: emailConfig.auth.user,
    pass: apiKey ? '***configured***' : '***missing***'
  });

  return nodemailer.createTransport(emailConfig);
}

// Send verification email
async function sendVerificationEmail(email, code, firstName = 'User') {
  try {
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');

    const mailOptions = {
      from: 'kennetherauyi@gmail.com', // Use the verified sender
      to: email,
      subject: 'Verify Your Invest Platform Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4af37;">Welcome to Invest Platform!</h2>
          <p>Hello ${firstName},</p>
          <p>Thank you for registering with Invest Platform. To complete your registration, please verify your email address.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Verification Code:</h3>
            <div style="font-size: 24px; font-weight: bold; color: #d4af37; letter-spacing: 5px; text-align: center; padding: 10px; background-color: #fff; border: 2px solid #d4af37; border-radius: 5px;">
              ${code}
            </div>
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>Best regards,<br>The Invest Platform Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
    console.log('Message ID:', info.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

// Test function
async function testEmailSending() {
  const testEmail = process.argv[2] || 'test@example.com';
  const verificationCode = generateVerificationCode();
  
  console.log('🧪 Testing Email Verification');
  console.log('==============================');
  console.log('Test email:', testEmail);
  console.log('Verification code:', verificationCode);
  console.log('');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.sendgrid.net (default)');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '2525 (default)');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');
  console.log('');

  if (!process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not configured in .env file');
    console.log('');
    console.log('📝 To fix this, add to your .env file:');
    console.log('EMAIL_PASS=your-sendgrid-api-key');
    return;
  }

  const success = await sendVerificationEmail(testEmail, verificationCode, 'Test User');
  
  if (success) {
    console.log('');
    console.log('🎉 Test completed successfully!');
    console.log('Use this code for testing:', verificationCode);
  } else {
    console.log('');
    console.log('❌ Test failed. Check the error messages above.');
  }
}

// Run the test
if (require.main === module) {
  testEmailSending().catch(console.error);
}

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  createTransporter
}; 