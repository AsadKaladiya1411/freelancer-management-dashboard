const { body } = require('express-validator');

const clientValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Client name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .optional({ values: 'falsy' })
    .trim(),
  body('company')
    .optional({ values: 'falsy' })
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'lead']).withMessage('Invalid status'),
];

module.exports = { clientValidator };
