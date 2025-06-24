const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/forexcrypto', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema (simplified for this script)
const userSchema = new mongoose.Schema({
  email: String,
  emailConfirmationCode: String,
  emailConfirmationExpires: Date
});

const User = mongoose.model('User', userSchema);

async function getVerificationCode(email) {
  try {
    console.log(`🔍 Looking for verification code for: ${email}`);
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    if (!user.emailConfirmationCode) {
      console.log('❌ No verification code found for this user');
      return;
    }
    
    console.log('✅ Found verification code!');
    console.log(`🔢 Code: ${user.emailConfirmationCode}`);
    console.log(`⏰ Expires: ${user.emailConfirmationExpires}`);
    
    // Check if code is expired
    if (user.emailConfirmationExpires && new Date() > user.emailConfirmationExpires) {
      console.log('⚠️  WARNING: This code has expired!');
    } else {
      console.log('✅ Code is still valid');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'testuser2@example.com';

console.log('🚀 Fetching verification code from database...\n');
getVerificationCode(email); 