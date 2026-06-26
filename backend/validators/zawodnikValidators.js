const { body, param } = require('express-validator');

const idParam = [param('id').isMongoId().withMessage('Nieprawidłowy identyfikator')];

const createZawodnikRules = [
  body('imie').trim().notEmpty().withMessage('Imię jest wymagane'),
  body('nazwisko').trim().notEmpty().withMessage('Nazwisko jest wymagane'),
  body('dataUrodzenia').isISO8601().withMessage('Nieprawidłowa data urodzenia'),
  body('okresWaznosciBadan').isISO8601().withMessage('Nieprawidłowa data ważności badań'),
  body('dgaWazneDo').optional({ checkFalsy: true }).isISO8601(),
  body('druzyna').isMongoId().withMessage('Nieprawidłowa drużyna'),
  body('status').optional().isIn(['AKTYWNY', 'NIEAKTYWNY']).withMessage('Nieprawidłowy status'),
  body('mail1').optional({ checkFalsy: true }).isEmail().withMessage('Nieprawidłowy email (mail1)'),
  body('mail2').optional({ checkFalsy: true }).isEmail().withMessage('Nieprawidłowy email (mail2)'),
];

const updateZawodnikRules = [
  ...idParam,
  body('imie').optional().trim().notEmpty().withMessage('Imię nie może być puste'),
  body('nazwisko').optional().trim().notEmpty().withMessage('Nazwisko nie może być puste'),
  body('dataUrodzenia').optional().isISO8601(),
  body('okresWaznosciBadan').optional().isISO8601(),
  body('dgaWazneDo').optional({ checkFalsy: true }).isISO8601(),
  body('druzyna').optional().isMongoId(),
  body('status').optional().isIn(['AKTYWNY', 'NIEAKTYWNY']),
  body('mail1').optional({ checkFalsy: true }).isEmail(),
  body('mail2').optional({ checkFalsy: true }).isEmail(),
];

module.exports = { createZawodnikRules, updateZawodnikRules, idParam };
