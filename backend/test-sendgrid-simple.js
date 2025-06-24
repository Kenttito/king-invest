require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Simple SendGrid Test');
console.log('=======================\n');

// Check environment variables
console.log('📧 Environment Check:');
console.log('- EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'Not set');
console.log('- EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set');
console.log('- EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set');
console.log('- EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 
  (process.env.EMAIL_PASS.startsWith('SG.') ? 
    `✓ Valid format (${process.env.EMAIL_PASS.length} chars)` : 
    '❌ Invalid format (should start with SG.)') : 
  '❌ Not set');

if (!process.env.EMAIL_PASS || !process.env.EMAIL_PASS.startsWith('SG.')) {
  console.log('\n❌ Invalid SendGrid API key format');
  console.log('Please check your .env file and ensure EMAIL_PASS starts with "SG."');
  process.exit(1);
}

// Create SendGrid transporter (using port 2525)
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 2525, // Changed from 587 to 2525
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.EMAIL_PASS
  }
});

console.log('\n🔧 Testing SendGrid connection (port 2525)...');

// Test the connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔍 Authentication Error - Possible causes:');
      console.log('1. Invalid API key');
      console.log('2. API key lacks "Mail Send" permissions');
      console.log('3. Account suspended or restricted');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n🔍 Timeout Error - Possible causes:');
      console.log('1. Network connectivity issues');
      console.log('2. Firewall blocking connection');
      console.log('3. SendGrid service issues');
    }
  } else {
    console.log('✅ Connection successful!');
    console.log('📧 SendGrid is properly configured');
    
    // Test sending an email
    console.log('\n📤 Testing email sending...');
    
    // Use the actual email address from environment variables
    const fromEmail = process.env.EMAIL_USER || 'kennetherauyi@gmail.com';
    console.log('- From:', fromEmail);
    console.log('- To: test@example.com');
    
    const mailOptions = {
      from: fromEmail,
      to: 'test@example.com',
      subject: 'SendGrid Test Email',
      text: 'This is a test email from your investment platform.',
      html: '<h1>SendGrid Test</h1><p>This is a test email from your investment platform.</p>'
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Email sending failed:', error.message);
        
        if (error.message.includes('verified Sender Identity')) {
          console.log('\n🔍 Sender Identity Error:');
          console.log('The "from" email address needs to be verified in SendGrid.');
          console.log('Please go to: https://app.sendgrid.com/settings/sender_auth');
          console.log('And verify the email address:', fromEmail);
        }
      } else {
        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('\n🎉 SendGrid is fully working!');
      }
    });
  }
}); 