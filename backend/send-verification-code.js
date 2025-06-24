const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Generate a 6-digit verification code
function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString();
}

// Create SendGrid transporter
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

  console.log('📧 Email Configuration:');
  console.log(`   Host: ${emailConfig.host}`);
  console.log(`   Port: ${emailConfig.port}`);
  console.log(`   User: ${emailConfig.auth.user}`);
  console.log(`   API Key: ${apiKey ? '***configured***' : '***missing***'}`);
  console.log('');

  return nodemailer.createTransport(emailConfig);
}

// Send verification email
async function sendVerificationEmail(email, code) {
  try {
    const transporter = createTransporter();
    
    // Verify transporter
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@kingsinvest.com',
      to: email,
      subject: 'Email Verification Code - Kings Invest',
      text: `verification code: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Kings Invest</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="color: #007bff; margin-bottom: 10px;">Email Verification</h3>
            <p style="font-size: 16px; color: #666; margin-bottom: 20px;">Your verification code is:</p>
            <div style="background-color: #007bff; color: white; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #999; margin-top: 20px;">This code will expire in 24 hours.</p>
          </div>
          <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `
    };

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${email}`);
    console.log(`   Code: ${code}`);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Please provide an email address');
    console.log('');
    console.log('Usage: node send-verification-code.js <email>');
    console.log('');
    console.log('Example:');
    console.log('  node send-verification-code.js user@example.com');
    console.log('');
    return;
  }

  console.log('🎯 Kings Invest - Email Verification Code Generator');
  console.log('==================================================');
  console.log(`📧 Target Email: ${email}`);
  console.log('');

  // Generate verification code
  const verificationCode = generateVerificationCode();
  console.log(`🔢 Generated Code: ${verificationCode}`);
  console.log('');

  // Send email
  const result = await sendVerificationEmail(email, verificationCode);
  
  if (result.success) {
    console.log('');
    console.log('🎉 SUCCESS!');
    console.log('===========');
    console.log(`📧 Email sent to: ${email}`);
    console.log(`🔢 Verification code: ${verificationCode}`);
    console.log(`📝 Message: "verification code: ${verificationCode}"`);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Check your email inbox');
    console.log('   2. Check your spam/junk folder');
    console.log('   3. Use the code in your application');
    console.log('');
    console.log('💡 If you don\'t receive the email:');
    console.log('   - Check your SendGrid dashboard for delivery status');
    console.log('   - Verify the email address is correct');
    console.log('   - Try running this script again');
  } else {
    console.log('');
    console.log('❌ FAILED!');
    console.log('==========');
    console.log(`Error: ${result.error}`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your .env file configuration');
    console.log('   2. Verify your SendGrid API key');
    console.log('   3. Ensure your sender email is verified in SendGrid');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateVerificationCode, sendVerificationEmail }; 