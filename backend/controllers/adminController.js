const User = require('../models/User');
const Config = require('../models/Config');

// Get all users (for admin dashboard)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { role: 'user' };
    
    if (status === 'pending') {
      query = { ...query, emailConfirmed: true, isActive: true, isApproved: false };
    } else if (status === 'approved') {
      query = { ...query, isApproved: true };
    } else if (status === 'unverified') {
      query = { ...query, emailConfirmed: false };
    }

    const users = await User.find(query)
      .select('-password -twoFASecret')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user statistics (for admin dashboard)
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const verifiedUsers = await User.countDocuments({ role: 'user', emailConfirmed: true });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const unverifiedUsers = await User.countDocuments({ role: 'user', emailConfirmed: false });

    res.json({
      totalUsers,
      verifiedUsers,
      activeUsers,
      unverifiedUsers,
      verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get crypto addresses (for admin dashboard)
exports.getCryptoAddresses = async (req, res) => {
  try {
    console.log('getCryptoAddresses called by user:', req.user);
    console.log('User role:', req.user?.role);
    
    const addresses = await Config.findOne({ key: 'crypto_addresses' });
    console.log('Found addresses in DB:', addresses);
    
    if (!addresses) {
      // Return default addresses if none are configured
      const defaultAddresses = {
        BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        ETH: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        USDT: 'TQn9Y2khDD95J42FQtQTdwVVR93QZ5Mqoa',
        XRP: 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh'
      };
      console.log('No addresses found in DB, returning defaults:', defaultAddresses);
      return res.json(defaultAddresses);
    }
    
    // Log the actual saved addresses
    console.log('Raw addresses.value from DB:', addresses.value);
    console.log('XRP address in DB:', addresses.value.XRP);
    
    // Ensure all required fields are present, but don't override existing values
    const responseAddresses = {
      BTC: addresses.value.BTC || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      ETH: addresses.value.ETH || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      USDT: addresses.value.USDT || 'TQn9Y2khDD95J42FQtQTdwVVR93QZ5Mqoa',
      XRP: addresses.value.XRP || 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh',
      // Include QR codes if they exist
      BTC_QR: addresses.value.BTC_QR || null,
      ETH_QR: addresses.value.ETH_QR || null,
      USDT_QR: addresses.value.USDT_QR || null,
      XRP_QR: addresses.value.XRP_QR || null
    };
    
    console.log('Returning addresses to admin:', responseAddresses);
    res.json(responseAddresses);
  } catch (err) {
    console.error('Error fetching crypto addresses:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update crypto addresses (for admin dashboard)
exports.updateCryptoAddresses = async (req, res) => {
  try {
    console.log('updateCryptoAddresses called by user:', req.user);
    console.log('User role:', req.user?.role);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // Fetch existing config to preserve any fields not being updated
    let existingConfig = await Config.findOne({ key: 'crypto_addresses' });
    let existingAddresses = existingConfig ? existingConfig.value : {};
    
    console.log('Existing addresses in DB:', existingAddresses);
    
    const { BTC, ETH, USDT, XRP } = req.body;
    
    // Merge new values with existing values, so no field is lost
    const addresses = { 
      BTC: BTC || existingAddresses.BTC || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      ETH: ETH || existingAddresses.ETH || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      USDT: USDT || existingAddresses.USDT || 'TQn9Y2khDD95J42FQtQTdwVVR93QZ5Mqoa',
      XRP: XRP || existingAddresses.XRP || 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh'
    };
    
    console.log('Merged addresses to save:', addresses);
    
    // Validate addresses (only validate if they are provided)
    if (BTC && (!BTC.startsWith('bc1') && !BTC.startsWith('1') && !BTC.startsWith('3'))) {
      console.log('Invalid BTC address:', BTC);
      return res.status(400).json({ message: 'Invalid BTC address format' });
    }
    
    if (ETH && (!ETH.startsWith('0x') || ETH.length !== 42)) {
      console.log('Invalid ETH address:', ETH);
      return res.status(400).json({ message: 'Invalid ETH address format' });
    }
    
    if (USDT && (!USDT.startsWith('T') || USDT.length < 30)) {
      console.log('Invalid USDT address:', USDT);
      return res.status(400).json({ message: 'Invalid USDT address format' });
    }
    
    if (XRP && (!XRP.startsWith('r') || XRP.length < 25 || XRP.length > 35)) {
      console.log('Invalid XRP address:', XRP);
      return res.status(400).json({ message: 'Invalid XRP address format' });
    }
    
    // Preserve existing QR codes if not being updated
    if (existingAddresses.BTC_QR) addresses.BTC_QR = existingAddresses.BTC_QR;
    if (existingAddresses.ETH_QR) addresses.ETH_QR = existingAddresses.ETH_QR;
    if (existingAddresses.USDT_QR) addresses.USDT_QR = existingAddresses.USDT_QR;
    if (existingAddresses.XRP_QR) addresses.XRP_QR = existingAddresses.XRP_QR;
    
    // Add QR code image paths if files were uploaded
    if (req.files) {
      console.log('Files uploaded:', Object.keys(req.files));
      console.log('Files details:', req.files);
      
      if (req.files.BTC_QR) {
        console.log('BTC_QR file uploaded:', req.files.BTC_QR[0].filename);
        addresses.BTC_QR = `/uploads/qr-codes/${req.files.BTC_QR[0].filename}`;
      }
      if (req.files.ETH_QR) {
        console.log('ETH_QR file uploaded:', req.files.ETH_QR[0].filename);
        addresses.ETH_QR = `/uploads/qr-codes/${req.files.ETH_QR[0].filename}`;
      }
      if (req.files.USDT_QR) {
        console.log('USDT_QR file uploaded:', req.files.USDT_QR[0].filename);
        addresses.USDT_QR = `/uploads/qr-codes/${req.files.USDT_QR[0].filename}`;
      }
      if (req.files.XRP_QR) {
        console.log('XRP_QR file uploaded:', req.files.XRP_QR[0].filename);
        addresses.XRP_QR = `/uploads/qr-codes/${req.files.XRP_QR[0].filename}`;
      } else {
        console.log('XRP_QR file not found in uploaded files');
      }
    } else {
      console.log('No files uploaded');
    }
    
    console.log('Final addresses and QR codes to save:', addresses);
    console.log('XRP address being saved:', addresses.XRP);
    
    // Update or create the config
    const result = await Config.findOneAndUpdate(
      { key: 'crypto_addresses' },
      { value: addresses },
      { upsert: true, new: true }
    );
    console.log('Saved to DB:', result);
    console.log('Saved XRP address in DB:', result.value.XRP);
    
    // Verify the save by fetching it back
    const verifySave = await Config.findOne({ key: 'crypto_addresses' });
    console.log('Verification - fetched from DB:', verifySave.value);
    console.log('Verification - XRP address:', verifySave.value.XRP);
    
    res.json({ message: 'Crypto addresses and QR codes updated successfully', addresses });
  } catch (err) {
    console.error('Error updating crypto addresses:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 