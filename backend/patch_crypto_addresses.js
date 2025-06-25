const mongoose = require('mongoose');
const Config = require('./models/Config');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function patchCryptoAddresses() {
  try {
    console.log('Starting crypto addresses patch...');
    
    // Find the existing config
    const config = await Config.findOne({ key: 'crypto_addresses' });
    
    if (!config) {
      console.log('No crypto_addresses config found. Creating new one...');
      const newConfig = new Config({
        key: 'crypto_addresses',
        value: {
          BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          ETH: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          USDT: 'TQn9Y2khDD95J42FQtQTdwVVR93QZ5Mqoa',
          XRP: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh'
        }
      });
      await newConfig.save();
      console.log('✅ Created new crypto_addresses config with XRP');
    } else {
      console.log('Found existing config:', config.value);
      
      // Check if XRP is missing
      if (!config.value.XRP) {
        console.log('❌ XRP is missing from existing config. Adding it...');
        config.value.XRP = 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh';
        await config.save();
        console.log('✅ Added XRP to existing config');
      } else {
        console.log('✅ XRP already exists in config:', config.value.XRP);
      }
      
      // Ensure all other fields exist
      const requiredFields = ['BTC', 'ETH', 'USDT', 'XRP'];
      let updated = false;
      
      for (const field of requiredFields) {
        if (!config.value[field]) {
          console.log(`❌ ${field} is missing. Adding default...`);
          switch (field) {
            case 'BTC':
              config.value[field] = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
              break;
            case 'ETH':
              config.value[field] = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
              break;
            case 'USDT':
              config.value[field] = 'TQn9Y2khDD95J42FQtQTdwVVR93QZ5Mqoa';
              break;
            case 'XRP':
              config.value[field] = 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh';
              break;
          }
          updated = true;
        }
      }
      
      if (updated) {
        await config.save();
        console.log('✅ Updated config with missing fields');
      }
      
      console.log('Final config:', config.value);
    }
    
    console.log('🎉 Crypto addresses patch completed successfully!');
  } catch (error) {
    console.error('❌ Error during patch:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the patch
patchCryptoAddresses(); 