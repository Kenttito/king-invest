const axios = require('axios');
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');

const API_BASE_URL = 'http://localhost:5001';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forexcrypto';

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set. Please set it to your MongoDB Atlas connection string.');
  process.exit(1);
}

async function main() {
  try {
    // 1. Register a new user
    const email = faker.internet.email();
    const password = 'Test1234!';
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const country = 'US';
    const currency = 'USD';
    const phone = '+12345678901'; // Always valid for backend

    console.log('Registering new user:', email);
    await axios.post(`${API_BASE_URL}/api/auth/register`, {
      email, password, firstName, lastName, country, currency, phone
    });
    console.log('Registration successful.');

    // 2. Connect to MongoDB and fetch the verification code
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String, emailConfirmationCode: String }));
    let userDoc = null;
    for (let i = 0; i < 5; i++) {
      userDoc = await User.findOne({ email });
      if (userDoc) break;
      await new Promise(res => setTimeout(res, 500));
    }
    if (!userDoc) throw new Error('User not found in DB after registration');
    const code = userDoc.emailConfirmationCode;
    console.log('Fetched email verification code:', code);

    // 3. Verify the email
    await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { email, code });
    console.log('Email verified successfully.');

    // 4. Log in as the new user
    const loginRes = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email, password
    });
    const token = loginRes.data.token;
    console.log('Login successful. Token:', token ? 'RECEIVED' : 'NOT RECEIVED');

    // 5. Fetch the latest crypto addresses
    const addrRes = await axios.get(`${API_BASE_URL}/api/user/crypto-addresses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Latest crypto addresses for new user:');
    console.log(JSON.stringify(addrRes.data, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    if (err.response) {
      console.error('API error:', err.response.status, err.response.statusText);
      console.error('API error data:', err.response.data);
    } else if (err.request) {
      console.error('No response received:', err.request);
    } else {
      console.error('Error:', err.message);
    }
    console.error('Stack:', err.stack);
    try { await mongoose.disconnect(); } catch {}
  }
}

main(); 