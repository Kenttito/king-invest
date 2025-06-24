const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kingsinvest', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixTransactionStatus() {
  try {
    console.log('Checking for transactions without status field...');
    
    // Find transactions where status is undefined or null
    const transactionsWithoutStatus = await Transaction.find({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: undefined }
      ]
    });
    
    console.log(`Found ${transactionsWithoutStatus.length} transactions without status`);
    
    if (transactionsWithoutStatus.length > 0) {
      console.log('Fixing transactions...');
      
      for (const tx of transactionsWithoutStatus) {
        console.log(`Transaction ID: ${tx._id}, Type: ${tx.type}`);
        
        // Set default status based on transaction type
        let defaultStatus = 'pending';
        if (tx.type === 'trade' || tx.type === 'return') {
          defaultStatus = 'completed';
        }
        
        tx.status = defaultStatus;
        await tx.save();
        console.log(`Fixed transaction ${tx._id} with status: ${defaultStatus}`);
      }
      
      console.log('All transactions fixed!');
    } else {
      console.log('All transactions already have status field');
    }
    
    // Also check for any transactions with invalid status values
    const invalidStatusTransactions = await Transaction.find({
      status: { $nin: ['pending', 'approved', 'declined', 'completed'] }
    });
    
    console.log(`Found ${invalidStatusTransactions.length} transactions with invalid status`);
    
    if (invalidStatusTransactions.length > 0) {
      console.log('Fixing invalid status transactions...');
      
      for (const tx of invalidStatusTransactions) {
        console.log(`Transaction ID: ${tx._id}, Current Status: ${tx.status}, Type: ${tx.type}`);
        
        // Set appropriate status based on transaction type
        let newStatus = 'pending';
        if (tx.type === 'trade' || tx.type === 'return') {
          newStatus = 'completed';
        }
        
        tx.status = newStatus;
        await tx.save();
        console.log(`Fixed transaction ${tx._id} with new status: ${newStatus}`);
      }
      
      console.log('All invalid status transactions fixed!');
    }
    
  } catch (error) {
    console.error('Error fixing transactions:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixTransactionStatus(); 