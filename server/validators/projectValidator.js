const { body } = require('express-validator');

const projectValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Project title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('client')
    .notEmpty().withMessage('Client is required')
    .isMongoId().withMessage('Invalid client ID'),
  body('budget')
    .optional({ values: 'falsy' })
    .isNumeric().withMessage('Budget must be a number')
    .custom((value) => value >= 0).withMessage('Budget cannot be negative'),
  body('deadline')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Invalid deadline date'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'on_hold', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
];

module.exports = { projectValidator };
