const nodemailer = require('nodemailer');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const generateCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendTestEmail = async (apiKey, fromEmail, toEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 2525,
      secure: false,
      auth: {
        user: 'apikey',
        pass: apiKey
      }
    });

    await transporter.verify();
    console.log('✅ Email transporter verified successfully');

    const code = generateCode();
    const mailOptions = {
      from: fromEmail, // Use the verified sender email
      to: toEmail,
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
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 From:', fromEmail);
    console.log('📧 To:', toEmail);
    console.log('🔢 Code:', code);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

const main = async () => {
  console.log('🚀 Quick Email Test for Kings Invest');
  console.log('=====================================');
  console.log('');
  
  const apiKey = await question('Enter your SendGrid API key (starts with SG.): ');
  const fromEmail = await question('Enter your VERIFIED sender email (must be verified in SendGrid): ');
  const toEmail = await question('Enter recipient email address: ');
  
  console.log('');
  console.log('🔧 Testing email configuration...');
  console.log('📧 From:', fromEmail);
  console.log('📧 To:', toEmail);
  
  const success = await sendTestEmail(apiKey, fromEmail, toEmail);
  
  if (success) {
    console.log('');
    console.log('🎉 SUCCESS! Check your email for the verification code.');
    console.log('📧 If you don\'t see it, check your spam/junk folder.');
    console.log('');
    console.log('💡 To make this permanent, update your .env file:');
    console.log(`   EMAIL_PASS=${apiKey}`);
    console.log(`   EMAIL_USER=${fromEmail}`);
  } else {
    console.log('');
    console.log('❌ FAILED! Common issues:');
    console.log('1. Sender email not verified in SendGrid');
    console.log('2. Invalid API key');
    console.log('3. Network connectivity issues');
    console.log('');
    console.log('🔧 To verify sender email:');
    console.log('   - Go to https://app.sendgrid.com/settings/sender_auth');
    console.log('   - Click "Verify a Single Sender"');
    console.log('   - Add and verify your email address');
  }
  
  rl.close();
};

main().catch(console.error); 