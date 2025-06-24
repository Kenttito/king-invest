const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// User Schema (simplified for this script)
const userSchema = new mongoose.Schema({
  email: String,
  emailConfirmationCode: String,
  emailConfirmationExpires: Date,
  isActive: Boolean
});

const User = mongoose.model('User', userSchema);

// Generate verification code
function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString();
}

// Generate code for a specific user
async function generateCodeForUser(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      return null;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Update user with new code
    user.emailConfirmationCode = verificationCode;
    user.emailConfirmationExpires = expiresAt;
    user.isActive = false; // Ensure user is not active until verified
    
    await user.save();
    
    console.log(`✅ Updated user with verification code: ${verificationCode}`);
    console.log(`⏰ Code expires at: ${expiresAt.toLocaleString()}`);
    
    return verificationCode;
    
  } catch (error) {
    console.error('❌ Error generating code for user:', error.message);
    return null;
  }
}

// List all users (for reference)
async function listUsers() {
  try {
    const users = await User.find({}, 'email isActive emailConfirmationCode');
    console.log('\n📋 All users in database:');
    console.log('========================');
    
    if (users.length === 0) {
      console.log('No users found');
      return;
    }
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`   Has Code: ${user.emailConfirmationCode ? 'Yes' : 'No'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

// Main function
async function main() {
  await connectDB();
  
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ Please provide an email address');
    console.log('Usage: node generate-test-code.js <email>');
    console.log('');
    console.log('Available options:');
    console.log('  --list-users    List all users in database');
    console.log('');
    
    if (process.argv.includes('--list-users')) {
      await listUsers();
    }
    
    await mongoose.disconnect();
    return;
  }
  
  console.log(`🚀 Generating verification code for: ${email}`);
  console.log('==========================================');
  
  const code = await generateCodeForUser(email);
  
  if (code) {
    console.log('');
    console.log('🎯 Summary:');
    console.log(`Email: ${email}`);
    console.log(`Code: ${code}`);
    console.log('');
    console.log('📝 Use this code to verify the user account in your application');
    console.log('⚠️  This code will expire in 24 hours');
  }
  
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
} 