const express = require('express');
const router = express.Router();
const investmentPlanController = require('../controllers/investmentPlanController');

router.get('/', investmentPlanController.getPlans);

module.exports = router; 