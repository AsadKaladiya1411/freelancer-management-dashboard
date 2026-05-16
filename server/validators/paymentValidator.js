const { body } = require('express-validator');

const paymentValidator = [
  body('project')
    .notEmpty().withMessage('Project is required')
    .isMongoId().withMessage('Invalid project ID'),
  body('client')
    .notEmpty().withMessage('Client is required')
    .isMongoId().withMessage('Invalid client ID'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .custom((value) => value > 0).withMessage('Amount must be greater than 0'),
  body('paymentDate')
    .notEmpty().withMessage('Payment date is required')
    .isISO8601().withMessage('Invalid payment date'),
  body('paymentMethod')
    .optional()
    .isIn(['bank_transfer', 'upi', 'cash', 'paypal', 'stripe', 'other'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
];

module.exports = { paymentValidator };
