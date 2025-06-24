const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = 'admin@yourplatform.com';
  const password = 'admin123';
  const firstName = 'Admin';
  const lastName = 'User';
  const country = 'US';
  const currency = 'USD';
  const phone = '1234567890';

  let user = await User.findOne({ email });
  if (user) {
    console.log('Admin user already exists:', email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    country,
    currency,
    phone,
    role: 'admin',
    emailConfirmed: true,
    isActive: true,
  });
  await user.save();
  console.log('✅ Admin user created:', email);
  process.exit(0);
}

createAdmin(); 