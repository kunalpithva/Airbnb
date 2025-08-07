const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  home: {
    type: Schema.Types.ObjectId,
    ref: 'Home',
    required: true
  },
  // firstName: {
  //   type: String, // ✅ Add this
  //   required: true
  // },
  // houseName: {
  //   type: String, // ✅ Add this
  //   required: true
  // },
  // price: {
  //   type: Number, // ✅ Add this
  //   required: true
  // },
  amount: {
    type: Number,
    required: true
  },
  cardNumber: {
    type: String
  },
  upiId: {
    type: String
  },
  walletType: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
