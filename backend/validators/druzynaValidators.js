const { body, param } = require('express-validator');

const idParam = [param('id').isMongoId().withMessage('Nieprawidłowy identyfikator')];

const createDruzynaRules = [
  body('nazwa').trim().notEmpty().withMessage('Nazwa drużyny jest wymagana'),
  body('rocznik').trim().notEmpty().withMessage('Rocznik jest wymagany'),
  body('trener').trim().notEmpty().withMessage('Trener jest wymagany'),
];

const updateDruzynaRules = [
  ...idParam,
  body('nazwa').optional().trim().notEmpty(),
  body('rocznik').optional().trim().notEmpty(),
  body('trener').optional().trim().notEmpty(),
];

module.exports = { createDruzynaRules, updateDruzynaRules, idParam };
