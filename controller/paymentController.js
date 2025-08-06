const Booking = require('../models/booking');
const Payment = require('../models/payment');

exports.getPaymentPage = async (req, res) => {
  const user = req.session.user;

  if (!user) return res.redirect('/login');

  const { homeId, bookingId } = req.query;

  const booking = await Booking.findOne({ _id: bookingId, user: user._id, home: homeId }).populate('home');

  if (!booking) return res.redirect('/booking');

  res.render('store/payment', {
    isLoggedIn: true,
    user,
    booking,     // ✅ pass the whole booking
    homeId,
    bookingId
  });
};

exports.postPayment = async (req, res) => {
  try {
    const { bookingId, cardNumber, upiId, walletType } = req.body;
    const homeId = req.params.homeId;
    const userId = req.session.user._id;

    const booking = await Booking.findOne({ _id: bookingId, user: userId, home: homeId }).populate('home');
    if (!booking) return res.redirect('/booking');

    const amount = booking.home.price;

    const payment = new Payment({
      user: userId,
      booking: booking._id,
      home: booking.home._id,
      amount,
      cardNumber: cardNumber || null,
      upiId: upiId || null,
      walletType: walletType || null,
    });

    await payment.save();

    // Delete the booking after successful payment
    await Booking.deleteOne({ _id: bookingId });

    res.render('store/payment-success', {
      isLoggedIn: true,
      user: req.session.user,
    });

  } catch (err) {
    console.error('❌ Payment failed:', err);
    res.redirect('/payment/failure');
  }
};
