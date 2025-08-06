const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
  bookedAt: { type: Date, default: Date.now },
  firstName: {
    type: String,
    required: true
  },
  homeName: {
    type: String,
  },
  homePrice:{
    type: String,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
