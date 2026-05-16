const express = require('express');
const router = express.Router();
const { createPayment, getPayments, getPayment, updatePayment, deletePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { paymentValidator } = require('../validators/paymentValidator');
const validate = require('../middleware/validate');

router.use(protect);

router.route('/')
  .post(paymentValidator, validate, createPayment)
  .get(getPayments);

router.route('/:id')
  .get(getPayment)
  .put(updatePayment)
  .delete(deletePayment);

module.exports = router;
