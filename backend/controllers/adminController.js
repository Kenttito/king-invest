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
        USDT: 'TQn9Y2khDD95J42FQtQTdwVVR93QZ5Mqoa'
      };
      console.log('Returning default addresses:', defaultAddresses);
      return res.json(defaultAddresses);
    }
    
    console.log('Returning stored addresses:', addresses.value);
    res.json(addresses.value);
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
    
    const { BTC, ETH, USDT } = req.body;
    
    // Validate addresses
    if (!BTC || !ETH || !USDT) {
      console.log('Missing addresses:', { BTC, ETH, USDT });
      return res.status(400).json({ message: 'All crypto addresses are required' });
    }
    
    // Basic validation for each address type
    if (!BTC.startsWith('bc1') && !BTC.startsWith('1') && !BTC.startsWith('3')) {
      console.log('Invalid BTC address:', BTC);
      return res.status(400).json({ message: 'Invalid BTC address format' });
    }
    
    if (!ETH.startsWith('0x') || ETH.length !== 42) {
      console.log('Invalid ETH address:', ETH);
      return res.status(400).json({ message: 'Invalid ETH address format' });
    }
    
    if (!USDT.startsWith('T') || USDT.length < 30) {
      console.log('Invalid USDT address:', USDT);
      return res.status(400).json({ message: 'Invalid USDT address format' });
    }
    
    // Create addresses object with QR code image paths
    const addresses = { 
      BTC, 
      ETH, 
      USDT
    };
    
    // Add QR code image paths if files were uploaded
    if (req.files) {
      if (req.files.BTC_QR) {
        addresses.BTC_QR = `/uploads/qr-codes/${req.files.BTC_QR[0].filename}`;
      }
      if (req.files.ETH_QR) {
        addresses.ETH_QR = `/uploads/qr-codes/${req.files.ETH_QR[0].filename}`;
      }
      if (req.files.USDT_QR) {
        addresses.USDT_QR = `/uploads/qr-codes/${req.files.USDT_QR[0].filename}`;
      }
    }
    
    console.log('Valid addresses and QR codes to save:', addresses);
    
    // Update or create the config
    const result = await Config.findOneAndUpdate(
      { key: 'crypto_addresses' },
      { value: addresses },
      { upsert: true, new: true }
    );
    console.log('Saved to DB:', result);
    
    res.json({ message: 'Crypto addresses and QR codes updated successfully', addresses });
  } catch (err) {
    console.error('Error updating crypto addresses:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 