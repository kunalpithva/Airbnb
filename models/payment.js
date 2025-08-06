const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
  amount: { type: Number, required: true },
  cardNumber: String,
  upiId: String,
  walletType: String,
  paidAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
