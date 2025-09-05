const express = require('express');
const fetch = require('node-fetch');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

// Initialize payment
router.post('/initialize', protect, async (req, res) => {
  const { amount } = req.body;
  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: req.user.email,
        amount: amount * 100 // kobo
      })
    });
    const data = await response.json();

    // Save transaction
    await Transaction.create({
      user: req.user._id,
      reference: data.data.reference,
      amount,
      status: 'pending'
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify payment
router.get('/verify/:reference', protect, async (req, res) => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });
    const data = await response.json();

    if (data.data.status === 'success') {
      const transaction = await Transaction.findOneAndUpdate(
        { reference: req.params.reference },
        { status: 'success' },
        { new: true }
      );

      // Credit user wallet
      const user = await User.findById(transaction.user);
      user.balance += transaction.amount;
      await user.save();
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
