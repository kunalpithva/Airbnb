const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home', required: true },
  firstName: { type: String, required: true },
  houseName: { type: String },  // ✅ must match Booking.create()
  price: { type: Number },      // ✅ must match Booking.create()
  bookedAt: { type: Date, default: Date.now },
  isPaid: { type: Boolean, default: false }
});

module.exports = mongoose.model('Booking', bookingSchema);
