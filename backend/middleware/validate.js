const { validationResult } = require('express-validator');

/**
 * Reużywalny middleware walidacji. Przyjmuje tablicę reguł express-validator,
 * uruchamia je, a następnie zwraca 400 z listą błędów, jeśli walidacja nie przeszła.
 *
 * Użycie w trasie:
 *   router.post('/', validate(createZawodnikRules), controller.createZawodnik)
 */
function validate(rules = []) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Błąd walidacji danych',
          errors: errors.array().map((e) => ({ pole: e.path, komunikat: e.msg })),
        });
      }
      next();
    },
  ];
}

module.exports = validate;
