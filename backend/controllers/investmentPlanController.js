const InvestmentPlan = require('../models/InvestmentPlan');

exports.getPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find({ isActive: true });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans', error: err.message });
  }
}; 