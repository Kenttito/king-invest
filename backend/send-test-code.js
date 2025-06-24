const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Generate a 6-digit verification code
const generateCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Create email transporter
const createTransporter = () => {
  // Try SendGrid first
  const sendGridKey = process.env.EMAIL_PASS || process.env.SENDGRID_API_KEY;
  
  if (sendGridKey && sendGridKey.startsWith('SG.')) {
    console.log('🔧 Using SendGrid configuration...');
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 2525,
      secure: false,
      auth: {
        user: 'apikey',
        pass: sendGridKey
      }
    });
  }
  
  // Try Gmail as fallback
  const gmailUser = process.env.EMAIL_USER;
  const gmailPass = process.env.EMAIL_PASS;
  
  if (gmailUser && gmailPass) {
    console.log('🔧 Using Gmail configuration...');
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
  }
  
  console.log('❌ No email configuration found');
  return null;
};

// Send verification code
const sendVerificationCode = async (email, code) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('❌ Email transporter not available');
      console.log('');
      console.log('📧 SETUP REQUIRED:');
      console.log('1. Add your SendGrid API key to .env file:');
      console.log('   EMAIL_PASS=SG.your-actual-api-key-here');
      console.log('');
      console.log('2. Or add Gmail credentials:');
      console.log('   EMAIL_USER=your-email@gmail.com');
      console.log('   EMAIL_PASS=your-app-password');
      return false;
    }

    // Verify transporter
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@kingsinvest.com',
      to: email,
      subject: 'Test Verification Code - Kings Invest',
      text: `verification code: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Kings Invest</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="color: #007bff; margin-bottom: 10px;">Test Verification Code</h3>
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">Your test verification code is:</p>
            <div style="background-color: #007bff; color: white; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #999; margin-top: 20px;">This is a test code sent at ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test verification email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 To:', email);
    console.log('🔢 Code:', code);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

// Main execution
const main = async () => {
  console.log('🚀 Sending Test Verification Code...');
  console.log('');
  
  // Get email from command line argument or use default
  const email = process.argv[2] || 'test@example.com';
  
  if (!email || email === 'test@example.com') {
    console.log('📧 Usage: node send-test-code.js your-email@example.com');
    console.log('');
    console.log('🔧 Or set your email in the script and run: node send-test-code.js');
    console.log('');
  }
  
  const code = generateCode();
  console.log('🔢 Generated code:', code);
  console.log('📧 Sending to:', email);
  console.log('');
  
  const success = await sendVerificationCode(email, code);
  
  if (success) {
    console.log('');
    console.log('🎉 SUCCESS! Check your email for the verification code.');
    console.log('📧 If you don\'t see it, check your spam/junk folder.');
  } else {
    console.log('');
    console.log('❌ FAILED! Please check your email configuration.');
  }
};

// Run the script
main().catch(console.error); 