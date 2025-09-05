const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  channel: { type: String, default: 'paystack' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
