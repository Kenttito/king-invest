require('dotenv').config();
const nodemailer = require('nodemailer');

// Email transporter setup (same as in authController)
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT || 587;
  const emailSecure = process.env.EMAIL_SECURE === 'true';

  console.log('📧 Email Configuration Test');
  console.log('==========================');
  console.log('- User:', emailUser ? '✓ Set' : '✗ Missing');
  console.log('- Pass:', emailPass ? '✓ Set' : '✗ Missing');
  console.log('- Service:', emailService);
  console.log('- Host:', emailHost || 'Using service default');
  console.log('- Port:', emailPort);
  console.log('- Secure:', emailSecure);
  console.log('');

  // Check if we have credentials
  if (!emailUser || !emailPass) {
    console.error('❌ Email credentials not configured');
    console.log('');
    console.log('💡 To fix this:');
    console.log('1. Create a .env file in the backend directory');
    console.log('2. Add your email credentials to the .env file');
    console.log('3. For Outlook: Use app passwords, not regular passwords');
    console.log('4. Check outlook-email-setup.md for detailed instructions');
    return null;
  }

  // Configure transporter based on service
  let config = {
    auth: {
      user: emailUser,
      pass: emailPass
    }
  };

  if (emailHost) {
    // Custom SMTP server (SendGrid, Mailgun, Outlook, etc.)
    config = {
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    };
    console.log('🔧 Using custom SMTP configuration');
  } else {
    // Service-based configuration (Gmail, Outlook, etc.)
    config.service = emailService;
    console.log('🔧 Using service-based configuration');
  }

  console.log('📤 Creating transporter...');
  return nodemailer.createTransport(config);
};

// Test email sending
const testEmail = async () => {
  console.log('🚀 Starting email test...\n');

  const transporter = createTransporter();
  if (!transporter) {
    console.log('❌ Cannot proceed without email configuration');
    return;
  }

  try {
    console.log('🔍 Verifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully!\n');

    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'test@example.com',
      to: 'test@example.com', // This will be replaced with your email
      subject: '🧪 Email Verification Test - Investment Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">🎉 Email Configuration Successful!</h2>
          <p>Your email configuration is working perfectly.</p>
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #27ae60;">✅ What this means:</h3>
            <ul>
              <li>Email verification will work for new user registrations</li>
              <li>Users will receive verification codes via email</li>
              <li>Your investment platform is ready for production</li>
            </ul>
          </div>
          <p style="color: #7f8c8d; font-size: 12px;">
            This is a test email from your investment platform backend.
          </p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Response:', info.response);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Restart your server: node server.js');
    console.log('2. Test user registration');
    console.log('3. Check your email service dashboard for analytics');

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    console.log('');
    
    if (error.code === 'EAUTH') {
      console.log('🔧 Authentication Error - Possible solutions:');
      if (process.env.EMAIL_SERVICE === 'outlook' || process.env.EMAIL_HOST?.includes('outlook')) {
        console.log('1. Make sure you\'re using an app password, not your regular password');
        console.log('2. Enable 2-factor authentication on your Outlook account');
        console.log('3. Generate a new app password from Microsoft account settings');
        console.log('4. Check outlook-email-setup.md for detailed instructions');
      } else if (process.env.EMAIL_SERVICE === 'gmail') {
        console.log('1. Make sure you\'re using an app password, not your regular password');
        console.log('2. Enable 2-factor authentication on your Google account');
        console.log('3. Generate a new app password from Google account settings');
      } else {
        console.log('1. Check your email credentials are correct');
        console.log('2. Verify your email service settings');
        console.log('3. Make sure you\'re using the right authentication method');
      }
    } else if (error.code === 'ECONNECTION') {
      console.log('🔧 Connection Error - Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify SMTP settings (host, port, secure)');
      console.log('3. Try different port (587 or 465)');
      console.log('4. Check if your email service is accessible');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('🔧 Timeout Error - Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Try a different port');
      console.log('3. Check if your email service is experiencing issues');
    }
    
    console.log('');
    console.log('📖 For more help, check:');
    console.log('- outlook-email-setup.md (for Outlook)');
    console.log('- email-setup-guide.md (for Gmail)');
    console.log('- sendgrid-setup-guide.md (for SendGrid)');
  }
};

// Run the test
testEmail(); 