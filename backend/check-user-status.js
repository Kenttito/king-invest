const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/forexcrypto', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
  email: String,
  emailConfirmed: Boolean,
  isActive: Boolean,
  role: String,
  firstName: String,
  lastName: String
});

const User = mongoose.model('User', userSchema);

async function checkUserStatus(email) {
  try {
    console.log(`🔍 Checking status for user: ${email}`);
    
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found!');
    console.log('📊 User Status:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Email Confirmed: ${user.emailConfirmed}`);
    console.log(`   Is Active: ${user.isActive}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    
    if (user.emailConfirmed && !user.isActive) {
      console.log('\n⚠️  ISSUE: Email is confirmed but account is not active!');
      console.log('This might be causing the login issue.');
    }
    
    if (!user.emailConfirmed) {
      console.log('\n⚠️  ISSUE: Email is not confirmed!');
    }
    
    if (user.isActive && user.emailConfirmed) {
      console.log('\n✅ User should be able to login successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

const email = process.argv[2] || 'testuser2@example.com';
checkUserStatus(email); 