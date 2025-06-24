const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Config = require('../models/Config');
const mongoose = require('mongoose');

exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const wallet = await Wallet.findOne({ user: userId, currency: 'USD', type: 'fiat' });
    res.json({ balance: wallet ? wallet.balance : 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch balance', error: err.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('getActivity called for user:', userId);
    
    // Get limit from query parameter, default to 10
    const limit = parseInt(req.query.limit) || 10;
    console.log('Requested limit:', limit);
    console.log('Limit type:', typeof limit);
    
    // Get total count first
    const totalCount = await Transaction.countDocuments({ user: userId });
    console.log('Total transactions count:', totalCount);
    
    // Get transactions with limit
    const txs = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    console.log('Found transactions:', txs.length);
    console.log('Expected transactions:', Math.min(limit, totalCount));
    
    // Convert MongoDB documents to plain objects
    const plainTxs = txs.map(tx => tx.toObject());
    console.log('Converted to plain objects');
    
    // Debug: Log the first transaction in detail
    if (plainTxs.length > 0) {
      console.log('First transaction details:', JSON.stringify(plainTxs[0], null, 2));
      console.log('First transaction status:', plainTxs[0].status, 'Type:', typeof plainTxs[0].status);
    }
    
    // Map transactions for frontend
    const activityData = txs.map(tx => {
      let displayType;
      switch (tx.type) {
        case 'deposit':
          displayType = 'Deposit';
          break;
        case 'withdrawal':
          displayType = 'Withdrawal';
          break;
        case 'loss':
          displayType = 'Loss';
          break;
        case 'trade':
          displayType = 'Trade';
          break;
        case 'return':
          displayType = 'Return';
          break;
        default:
          displayType = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
      }
      const mappedTx = { 
        type: displayType, 
        amount: tx.amount, 
        date: tx.createdAt.toISOString().slice(0, 10),
        status: tx.status,
        currency: tx.details?.currency || 'USD',
        coin: tx.details?.coin // For crypto deposits
      };
      console.log('Mapped transaction:', mappedTx);
      return mappedTx;
    });
    
    console.log('Sending activity data:', activityData);
    const response = {
      activity: activityData,
      totalCount
    };
    console.log('Sending response format:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error('Error in getActivity:', err);
    res.status(500).json({ message: 'Failed to fetch activity', error: err.message });
  }
};

// ADMIN: List all users
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// ADMIN: Edit user
exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, country, currency, phone, role } = req.body;
    const user = await User.findByIdAndUpdate(id, { email, firstName, lastName, country, currency, phone, role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// ADMIN: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete user:', id);
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user's wallets
    const deletedWallets = await Wallet.deleteMany({ user: id });
    console.log('Deleted wallets:', deletedWallets.deletedCount);
    
    // Delete user's transactions
    const deletedTransactions = await Transaction.deleteMany({ user: id });
    console.log('Deleted transactions:', deletedTransactions.deletedCount);
    
    // Delete the user
    const deletedUser = await User.findByIdAndDelete(id);
    console.log('Deleted user:', deletedUser ? 'success' : 'failed');
    
    res.json({ 
      message: 'User and all associated data deleted successfully',
      deletedWallets: deletedWallets.deletedCount,
      deletedTransactions: deletedTransactions.deletedCount
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// ADMIN: Assign role
exports.assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to assign role', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

// User update their own profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('updateProfile called');
    console.log('User ID:', req.user.userId);
    console.log('User role:', req.user.role);
    console.log('Request body:', req.body);
    
    const userId = req.user.userId;
    const { firstName, lastName, country, currency, phone } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !country || !currency || !phone) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if phone number is already taken by another user
    const existingUser = await User.findOne({ phone, _id: { $ne: userId } });
    if (existingUser) {
      console.log('Phone number already taken by another user');
      return res.status(400).json({ message: 'Phone number is already registered with another account' });
    }
    
    console.log('Updating user profile...');
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, country, currency, phone },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      console.log('User not found after update');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Profile updated successfully');
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// ADMIN: List all withdrawals (optionally filter by status)
exports.getAllWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { type: 'withdrawal' };
    if (status) query.status = status;
    const txs = await Transaction.find(query).populate('user').sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch withdrawals', error: err.message });
  }
};

// ADMIN: Get all withdrawals for a specific user
exports.getUserWithdrawals = async (req, res) => {
  try {
    const { id } = req.params;
    const txs = await Transaction.find({ user: id, type: 'withdrawal' }).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user withdrawals', error: err.message });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('getWallet called for user:', userId);
    const wallet = await Wallet.findOne({ user: userId, currency: 'USD', type: 'fiat' });
    console.log('Wallet found:', wallet);
    console.log('Wallet details - Balance:', wallet?.balance, 'Invested:', wallet?.invested, 'Earnings:', wallet?.earnings);
    
    // Calculate total withdrawals
    const totalWithdrawalsAgg = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWithdrawals = totalWithdrawalsAgg.length > 0 ? totalWithdrawalsAgg[0].total : 0;
    
    console.log('Total withdrawals calculation:');
    console.log('- User ID:', userId);
    console.log('- Aggregation result:', totalWithdrawalsAgg);
    console.log('- Total withdrawals amount:', totalWithdrawals);
    
    // Debug: Get all completed withdrawal transactions for this user
    const completedWithdrawals = await Transaction.find({ 
      user: userId, 
      type: 'withdrawal', 
      status: 'completed' 
    }).sort({ createdAt: -1 });
    
    console.log('Completed withdrawal transactions:', completedWithdrawals.length);
    completedWithdrawals.forEach((tx, index) => {
      console.log(`  ${index + 1}. Amount: ${tx.amount}, Date: ${tx.createdAt}, ID: ${tx._id}`);
    });
    
    const response = {
      balance: wallet ? wallet.balance : 0,
      invested: wallet ? wallet.invested : 0,
      earnings: wallet ? wallet.earnings : 0,
      totalWithdrawals,
    };
    console.log('Sending wallet response:', response);
    res.json(response);
  } catch (err) {
    console.error('Error in getWallet:', err);
    res.status(500).json({ message: 'Failed to fetch wallet', error: err.message });
  }
};

// Get crypto addresses for deposit component
exports.getCryptoAddresses = async (req, res) => {
  try {
    const addresses = await Config.findOne({ key: 'crypto_addresses' });
    
    if (!addresses) {
      // Return default addresses if none are configured
      const defaultAddresses = {
        BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        ETH: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        USDT: 'TQn9Y2khDD95J42FQtQTdwVVR93QZ5Mqoa'
      };
      return res.json(defaultAddresses);
    }
    
    // Return addresses with QR code image paths
    const addressesWithQR = {
      BTC: addresses.value.BTC,
      ETH: addresses.value.ETH,
      USDT: addresses.value.USDT,
      BTC_QR: addresses.value.BTC_QR || null,
      ETH_QR: addresses.value.ETH_QR || null,
      USDT_QR: addresses.value.USDT_QR || null
    };
    
    res.json(addressesWithQR);
  } catch (err) {
    console.error('Error fetching crypto addresses:', err);
    res.status(500).json({ message: 'Failed to fetch crypto addresses', error: err.message });
  }
}; 