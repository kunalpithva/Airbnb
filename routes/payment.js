const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

// GET /payment/booking/pay?homeId=...&bookingId=...
router.get('/booking/pay', paymentController.getPaymentPage);

// POST /payment/booking/pay/:homeId
router.post('/booking/pay/:homeId', paymentController.postPayment);



module.exports = router;
