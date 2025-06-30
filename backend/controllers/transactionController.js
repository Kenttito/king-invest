const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const InvestmentPlan = require('../models/InvestmentPlan');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

// Helper: Send transaction email (deposit/withdrawal, all statuses)
async function sendTransactionEmail(user, tx, type, status) {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  let subject, statusText, introText;
  if (status === 'submitted') {
    subject = `Your ${typeLabel} Has Been Successfully Submitted`;
    statusText = 'Submitted';
    introText = `We're writing to confirm that your ${type} has been successfully submitted.`;
  } else if (status === 'approved') {
    subject = `Your ${typeLabel} Has Been Approved`;
    statusText = 'Approved';
    introText = `Good news! Your ${type} has been approved.`;
  } else if (status === 'declined') {
    subject = `Your ${typeLabel} Has Been Declined`;
    statusText = 'Declined';
    introText = `We're sorry, but your ${type} has been declined.`;
  } else {
    subject = `Your ${typeLabel} Update`;
    statusText = status;
    introText = `There is an update regarding your ${type}.`;
  }
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d4af37;">${typeLabel} ${statusText}</h2>
      <p>Hi ${user.firstName},</p>
      <p>${introText}</p>
      <p><b>📌 Transaction Details:</b></p>
      <ul>
        <li>Transaction Type: ${typeLabel}</li>
        <li>Amount: ${tx.amount} ${tx.details.currency}</li>
        <li>Date: ${tx.createdAt ? tx.createdAt.toLocaleString() : new Date().toLocaleString()}</li>
        <li>Status: ${statusText}</li>
        <li>Transaction ID: ${tx._id}</li>
      </ul>
      <br/>
      <p>If you did not authorize this transaction or have any questions, please contact our support team immediately.</p>
      <p style="font-size: 12px; color: #888;"><b>Note:</b> This is an automated email confirmation. No further action is required.<br/>Kings Invest Team</p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
}

// Helper: Send deposit email
async function sendDepositEmail(user, tx) {
  const subject = 'Deposit Submitted - Kings Invest';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d4af37;">Deposit Submitted</h2>
      <p>Hi ${user.firstName},</p>
      <p>Your deposit of <b>${tx.amount} ${tx.details.currency}</b> has been submitted and is pending approval.</p>
      <p>Status: <b>${tx.status}</b></p>
      <p>Date: ${tx.createdAt.toLocaleString()}</p>
      <hr/>
      <p style="font-size: 12px; color: #888;">If you did not make this deposit, please contact support immediately.</p>
      <p style="font-size: 12px; color: #888;">Kings Invest Team</p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
}

// Helper: Send withdrawal email
async function sendWithdrawalEmail(user, tx) {
  const subject = 'Withdrawal Requested - Kings Invest';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d4af37;">Withdrawal Requested</h2>
      <p>Hi ${user.firstName},</p>
      <p>Your withdrawal of <b>${tx.amount} ${tx.details.currency}</b> has been submitted and is pending approval.</p>
      <p>Status: <b>${tx.status}</b></p>
      <p>Date: ${tx.createdAt.toLocaleString()}</p>
      <hr/>
      <p style="font-size: 12px; color: #888;">If you did not request this withdrawal, please contact support immediately.</p>
      <p style="font-size: 12px; color: #888;">Kings Invest Team</p>
    </div>
  `;
  await sendEmail(user.email, subject, html);
}

exports.deposit = async (req, res) => {
  try {
    const { amount, currency, type = 'fiat' } = req.body;
    const userId = req.user.userId;
    
    console.log('Creating deposit:', { userId, amount, currency, type });
    
    // Create details object with coin information for crypto deposits
    const details = { currency, type };
    if (type === 'crypto' && ['BTC', 'ETH', 'USDT', 'XRP'].includes(currency)) {
      details.coin = currency; // Store the coin type for crypto deposits
      
      // Log specific crypto information
      let cryptoName;
      switch (currency) {
        case 'BTC':
          cryptoName = 'Bitcoin (BTC)';
          break;
        case 'ETH':
          cryptoName = 'Ethereum (ETH)';
          break;
        case 'USDT':
          cryptoName = 'Tether (USDT)';
          break;
        case 'XRP':
          cryptoName = 'Ripple (XRP)';
          break;
        default:
          cryptoName = currency;
      }
      console.log(`Creating ${cryptoName} deposit for user ${userId}: ${amount}`);
    }
    
    // Create a pending deposit transaction, do not update wallet balance yet
    const tx = new Transaction({ user: userId, type: 'deposit', amount, status: 'pending', details });
    await tx.save();
    
    // Send deposit submitted email
    const user = await User.findById(userId);
    if (user) await sendTransactionEmail(user, tx, 'deposit', 'submitted');
    
    const message = type === 'crypto' ? 
      `${currency} crypto deposit submitted, awaiting approval.` : 
      'Deposit submitted, awaiting approval.';
    
    res.json({ message });
  } catch (err) {
    console.error('Error creating deposit:', err);
    res.status(500).json({ message: 'Deposit failed', error: err.message });
  }
};

// ADMIN: List all pending deposits
exports.listPendingDeposits = async (req, res) => {
  try {
    const pending = await Transaction.find({ type: 'deposit', status: 'pending' }).populate('user');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending deposits', error: err.message });
  }
};

// ADMIN: Approve deposit
exports.approveDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== APPROVE DEPOSIT START ===');
    console.log('Approving deposit with ID:', id);
    
    const tx = await Transaction.findById(id);
    console.log('Transaction found:', tx);
    console.log('Transaction details:', tx?.details);
    
    if (!tx || tx.status !== 'pending' || tx.type !== 'deposit') {
      console.log('Transaction validation failed:', { 
        exists: !!tx, 
        status: tx?.status, 
        type: tx?.type 
      });
      return res.status(404).json({ message: 'Deposit not found or not pending' });
    }
    
    // Always update the USD/fiat wallet (which is what getWallet reads from)
    // This works for both fiat and crypto deposits since crypto deposits are stored as USD amounts
    const userId = tx.user;
    const amount = parseFloat(tx.amount);
    const depositType = tx.details?.type || 'fiat';
    const depositCurrency = tx.details?.currency || 'USD';
    const coin = tx.details?.coin; // For crypto deposits
    
    console.log('Processing deposit approval:', { 
      userId, 
      amount, 
      depositType, 
      depositCurrency, 
      coin 
    });
    
    // Find or create USD/fiat wallet (same wallet that getWallet reads from)
    let wallet = await Wallet.findOne({ user: userId, currency: 'USD', type: 'fiat' });
    console.log('USD/Fiat wallet before update:', wallet);
    
    if (!wallet) {
      wallet = new Wallet({ user: userId, currency: 'USD', type: 'fiat', balance: 0, invested: 0, earnings: 0 });
      console.log('Created new USD/Fiat wallet');
    }
    
    // Update both balance and invested (add to total balance and amount invested)
    const oldBalance = wallet.balance;
    const oldInvested = wallet.invested;
    console.log('Before update - Balance:', oldBalance, 'Invested:', oldInvested);
    
    wallet.balance += amount;
    wallet.invested += amount;
    
    console.log('After calculation - Balance:', wallet.balance, 'Invested:', wallet.invested);
    console.log('Amount being added:', amount);
    
    await wallet.save();
    
    // Verify the save worked by fetching the wallet again
    const updatedWallet = await Wallet.findById(wallet._id);
    console.log('After save - Balance:', updatedWallet.balance, 'Invested:', updatedWallet.invested);
    
    console.log(`Balance updated: ${oldBalance} + ${amount} = ${wallet.balance}`);
    console.log(`Invested updated: ${oldInvested} + ${amount} = ${wallet.invested}`);
    console.log('USD/Fiat wallet after update:', wallet);
    
    // Update transaction status
    tx.status = 'approved';
    await tx.save();
    console.log('Transaction marked as approved');
    
    // Create specific deposit info based on the type and coin
    let depositInfo;
    if (depositType === 'crypto' && coin) {
      switch (coin) {
        case 'BTC':
          depositInfo = 'Bitcoin (BTC) crypto deposit';
          break;
        case 'ETH':
          depositInfo = 'Ethereum (ETH) crypto deposit';
          break;
        case 'USDT':
          depositInfo = 'Tether (USDT) crypto deposit';
          break;
        case 'XRP':
          depositInfo = 'Ripple (XRP) crypto deposit';
          break;
        default:
          depositInfo = `${coin} crypto deposit`;
      }
    } else {
      depositInfo = `${depositCurrency} ${depositType} deposit`;
    }
    
    console.log(`Deposit approved for user ${userId}: ${amount} added to balance and invested from ${depositInfo}. New balance: ${wallet.balance}, New invested: ${wallet.invested}`);
    console.log('=== APPROVE DEPOSIT END ===');
    
    // Send deposit approved email
    const user = await User.findById(userId);
    if (user) await sendTransactionEmail(user, tx, 'deposit', 'approved');
    
    res.json({ 
      message: `Deposit approved and wallet updated. ${depositInfo} of ${amount} added to total balance and amount invested.` 
    });
  } catch (err) {
    console.error('Error approving deposit:', err);
    res.status(500).json({ message: 'Failed to approve deposit', error: err.message });
  }
};

// ADMIN: Decline deposit
exports.declineDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findById(id);
    if (!tx || tx.status !== 'pending' || tx.type !== 'deposit') return res.status(404).json({ message: 'Deposit not found or not pending' });
    tx.status = 'declined';
    await tx.save();
    // Send deposit declined email
    const user = await User.findById(tx.user);
    if (user) await sendTransactionEmail(user, tx, 'deposit', 'declined');
    res.json({ message: 'Deposit declined.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to decline deposit', error: err.message });
  }
};

// USER: Request withdrawal (pending admin approval)
exports.withdraw = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, currency, type = 'fiat' } = req.body;
    console.log('Withdrawal request:', { userId, amount, currency, type });
    
    if (!amount || !currency) return res.status(400).json({ message: 'Missing required fields' });
    const amt = Math.abs(parseFloat(amount));
    console.log('Parsed amount:', amt);
    
    // Always use the USD/fiat wallet for withdrawals (same wallet that getWallet reads from)
    // This works for all currencies since crypto deposits are stored as USD amounts
    let wallet = await Wallet.findOne({ user: userId, currency: 'USD', type: 'fiat' });
    console.log('Found wallet:', wallet ? { balance: wallet.balance, invested: wallet.invested, earnings: wallet.earnings } : 'null');
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      console.log('Creating new USD/fiat wallet for user');
      wallet = new Wallet({ 
        user: userId, 
        currency: 'USD', 
        type: 'fiat', 
        balance: 0, 
        invested: 0, 
        earnings: 0 
      });
      await wallet.save();
      console.log('New wallet created with balance:', wallet.balance);
    }
    
    if (wallet.balance < amt) {
      console.log('Insufficient balance:', { requested: amt, available: wallet.balance });
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Deduct from balance immediately
    wallet.balance -= amt;
    await wallet.save();
    console.log('Balance deducted, new balance:', wallet.balance);

    // Create a pending withdrawal transaction
    const tx = new Transaction({ user: userId, wallet: wallet._id, type: 'withdrawal', amount: amt, status: 'pending', details: { currency, type } });
    await tx.save();
    
    // Send withdrawal submitted email
    const user = await User.findById(userId);
    if (user) await sendTransactionEmail(user, tx, 'withdrawal', 'submitted');
    
    res.json({ message: 'Withdrawal submitted, awaiting approval.' });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ message: 'Withdrawal failed', error: err.message });
  }
};

exports.invest = async (req, res) => {
  try {
    const { amount, planId, currency, type = 'fiat' } = req.body;
    const userId = req.user.userId;
    const plan = await InvestmentPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    let wallet = await Wallet.findOne({ user: userId, currency, type });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    wallet.balance -= parseFloat(amount);
    await wallet.save();
    const tx = new Transaction({ user: userId, wallet: wallet._id, type: 'trade', amount, status: 'completed', details: { plan: planId, currency, type } });
    await tx.save();
    res.json({ message: 'Investment successful', balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: 'Investment failed', error: err.message });
  }
};

// ADMIN: Instantly credit a user's wallet (manual deposit)
exports.adminDeposit = async (req, res) => {
  try {
    const { userId, amount, currency, type = 'fiat', statType = 'balance' } = req.body;
    console.log('adminDeposit called with:', { userId, amount, currency, type, statType });
    if (!userId || !amount || !currency) return res.status(400).json({ message: 'Missing required fields' });
    let wallet = await Wallet.findOne({ user: userId, currency, type });
    console.log('Wallet before update:', wallet);
    if (!wallet) {
      wallet = new Wallet({ user: userId, currency, type, balance: 0, invested: 0, earnings: 0 });
      console.log('Created new wallet');
    }
    let amt = Math.abs(parseFloat(amount));
    let message = '';
    if (statType === 'balance') {
      wallet.balance += amt;
      wallet.invested += amt;
      await wallet.save();
      const tx = new Transaction({ user: userId, wallet: wallet._id, type: 'deposit', amount: amt, status: 'completed', details: { currency, type, adminDeposit: true, statType: 'balance' } });
      await tx.save();
      message = 'Balance and invested amount credited successfully.';
      console.log('Wallet after balance update:', wallet);
      return res.json({ message, balance: wallet.balance, invested: wallet.invested });
    } else if (statType === 'invested') {
      wallet.invested += amt;
      wallet.balance += amt;
      await wallet.save();
      const tx = new Transaction({ user: userId, wallet: wallet._id, type: 'trade', amount: amt, status: 'completed', details: { currency, type, adminDeposit: true, statType: 'invested' } });
      await tx.save();
      message = 'Invested amount credited successfully and added to balance.';
      console.log('Wallet after invested update:', wallet);
      return res.json({ message, invested: wallet.invested, balance: wallet.balance });
    } else if (statType === 'earnings') {
      wallet.earnings += amt;
      wallet.balance += amt;
      await wallet.save();
      const tx = new Transaction({ user: userId, wallet: wallet._id, type: 'return', amount: amt, status: 'completed', details: { currency, type, adminDeposit: true, statType: 'earnings' } });
      await tx.save();
      message = 'Earnings credited successfully and added to balance.';
      console.log('Wallet after earnings update:', wallet);
      return res.json({ message, earnings: wallet.earnings, balance: wallet.balance });
    } else {
      return res.status(400).json({ message: 'Invalid statType' });
    }
  } catch (err) {
    console.error('Error in adminDeposit:', err);
    res.status(500).json({ message: 'Admin fund management failed', error: err.message });
  }
};

// ADMIN: Instantly deduct from a user's wallet (manual deduction)
exports.adminDeduct = async (req, res) => {
  try {
    const { userId, amount, currency, type = 'fiat', statType = 'balance' } = req.body;
    console.log('adminDeduct called with:', { userId, amount, currency, type, statType });
    if (!userId || !amount || !currency) return res.status(400).json({ message: 'Missing required fields' });
    let wallet = await Wallet.findOne({ user: userId, currency, type });
    console.log('Wallet before deduction:', wallet);
    if (!wallet) {
      return res.status(400).json({ message: 'User wallet not found' });
    }
    let amt = Math.abs(parseFloat(amount));
    let message = '';
    
    if (statType === 'balance') {
      if (wallet.balance < amt) {
        return res.status(400).json({ message: 'Insufficient balance to deduct' });
      }
      wallet.balance -= amt;
      await wallet.save();
      const tx = new Transaction({ user: userId, wallet: wallet._id, type: 'loss', amount: amt, status: 'completed', details: { currency, type, adminDeduct: true, statType: 'balance' } });
      await tx.save();
      message = 'Balance deducted successfully.';
      console.log('Wallet after balance deduction:', wallet);
      return res.json({ message, balance: wallet.balance });
    } else if (statType === 'invested') {
      if (wallet.invested < amt) {
        return res.status(400).json({ message: 'Insufficient invested amount to deduct' });
      }
      wallet.invested -= amt;
      wallet.balance -= amt;
      await wallet.save();
      const tx = new Transaction({ user: userId, wallet: wallet._id, type: 'loss', amount: amt, status: 'completed', details: { currency, type, adminDeduct: true, statType: 'invested' } });
      await tx.save();
      message = 'Invested amount deducted successfully and removed from balance.';
      console.log('Wallet after invested deduction:', wallet);
      return res.json({ message, invested: wallet.invested, balance: wallet.balance });
    } else if (statType === 'earnings') {
      if (wallet.earnings < amt) {
        return res.status(400).json({ message: 'Insufficient earnings to deduct' });
      }
      wallet.earnings -= amt;
      wallet.balance -= amt;
      await wallet.save();
      const tx = new Transaction({ user: userId, wallet: wallet._id, type: 'loss', amount: amt, status: 'completed', details: { currency, type, adminDeduct: true, statType: 'earnings' } });
      await tx.save();
      message = 'Earnings deducted successfully and removed from balance.';
      console.log('Wallet after earnings deduction:', wallet);
      return res.json({ message, earnings: wallet.earnings, balance: wallet.balance });
    } else {
      return res.status(400).json({ message: 'Invalid statType' });
    }
  } catch (err) {
    console.error('Error in adminDeduct:', err);
    res.status(500).json({ message: 'Admin fund deduction failed', error: err.message });
  }
};

// ADMIN: Approve a withdrawal
exports.approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== APPROVE WITHDRAWAL START ===');
    console.log('Approving withdrawal with ID:', id);
    
    const tx = await Transaction.findById(id);
    console.log('Transaction found:', tx);
    console.log('Transaction details:', tx?.details);
    
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') {
      console.log('Transaction validation failed:', { 
        exists: !!tx, 
        type: tx?.type, 
        status: tx?.status 
      });
      return res.status(404).json({ message: 'Withdrawal not found or not pending' });
    }
    
    const userId = tx.user;
    const amount = parseFloat(tx.amount);
    const withdrawalType = tx.details?.type || 'fiat';
    const withdrawalCurrency = tx.details?.currency || 'USD';
    
    console.log('Processing withdrawal approval:', { 
      userId, 
      amount, 
      withdrawalType, 
      withdrawalCurrency 
    });
    
    // Update transaction status to completed
    tx.status = 'completed';
    await tx.save();
    console.log('Transaction marked as completed');
    
    // Verify the transaction was saved correctly
    const updatedTx = await Transaction.findById(id);
    console.log('Updated transaction status:', updatedTx.status);
    
    // Create withdrawal info for logging
    let withdrawalInfo;
    if (withdrawalType === 'crypto' && withdrawalCurrency) {
      switch (withdrawalCurrency) {
        case 'BTC':
          withdrawalInfo = 'Bitcoin (BTC) crypto withdrawal';
          break;
        case 'ETH':
          withdrawalInfo = 'Ethereum (ETH) crypto withdrawal';
          break;
        case 'USDT':
          withdrawalInfo = 'Tether (USDT) crypto withdrawal';
          break;
        default:
          withdrawalInfo = `${withdrawalCurrency} crypto withdrawal`;
      }
    } else {
      withdrawalInfo = `${withdrawalCurrency} ${withdrawalType} withdrawal`;
    }
    
    console.log(`Withdrawal approved for user ${userId}: ${amount} from ${withdrawalInfo}. Transaction ID: ${id}`);
    console.log('=== APPROVE WITHDRAWAL END ===');
    
    // Send withdrawal approved email
    const user = await User.findById(userId);
    if (user) await sendTransactionEmail(user, tx, 'withdrawal', 'approved');
    
    res.json({ 
      message: `Withdrawal approved successfully. ${withdrawalInfo} of ${amount} has been processed.` 
    });
  } catch (err) {
    console.error('Error approving withdrawal:', err);
    res.status(500).json({ message: 'Failed to approve withdrawal', error: err.message });
  }
};

// ADMIN: Decline a withdrawal
exports.declineWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await Transaction.findById(id);
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') {
      return res.status(404).json({ message: 'Withdrawal not found or not pending' });
    }
    
    // Find the associated wallet and refund the amount
    const wallet = await Wallet.findById(tx.wallet);
    if (wallet) {
      wallet.balance += tx.amount;
      await wallet.save();
    }
    
    tx.status = 'declined';
    await tx.save();
    
    // Send withdrawal declined email
    const user = await User.findById(tx.user);
    if (user) await sendTransactionEmail(user, tx, 'withdrawal', 'declined');
    
    res.json({ message: 'Withdrawal declined and funds returned to balance.' });
  } catch (err) {
    console.error("Error declining withdrawal:", err);
    res.status(500).json({ message: 'Failed to decline withdrawal', error: err.message });
  }
};

// ADMIN: List all pending withdrawals
exports.listPendingWithdrawals = async (req, res) => {
  try {
    const txs = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('user', 'email firstName lastName');
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending withdrawals', error: err.message });
  }
};

// ADMIN: List all deposits (not just pending)
exports.listAllDeposits = async (req, res) => {
  try {
    const allDeposits = await Transaction.find({ type: 'deposit' })
      .populate('user')
      .sort({ 
        status: 1, // Sort by status (pending first, then others)
        createdAt: 1 // Then by creation date, earliest first
      });
    
    // Custom sort to ensure pending deposits are always at the top
    const sortedDeposits = allDeposits.sort((a, b) => {
      // If one is pending and the other isn't, pending goes first
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      
      // If both have the same status, sort by creation date (earliest first)
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    
    res.json(sortedDeposits);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all deposits', error: err.message });
  }
};

// ADMIN: Clear all deposits
exports.clearAllDeposits = async (req, res) => {
  try {
    const result = await Transaction.deleteMany({ type: 'deposit' });
    console.log(`Cleared ${result.deletedCount} deposits from database`);
    res.json({ 
      message: `Successfully cleared ${result.deletedCount} deposits`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error('Error clearing deposits:', err);
    res.status(500).json({ message: 'Failed to clear deposits', error: err.message });
  }
}; 