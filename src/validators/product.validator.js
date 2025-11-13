const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Le nom du produit est obligatoire",
    "string.min": "Le nom doit contenir au moins 3 caractères",
  }),
  sku: Joi.string().pattern(/^[A-Za-z0-9\-_]+$/).min(3).max(20).required().messages({
    "string.pattern.base": "Le SKU doit contenir uniquement des caractères alphanumériques, tirets et underscores",
  }),
  price: Joi.number().positive().precision(2).required().messages({
    "number.positive": "Le prix doit être un nombre positif",
  }),
  category: Joi.string().min(3).max(100).required().messages({
    "string.empty": "La catégorie du produit est obligatoire",
    "string.min": "La catégorie doit contenir au moins 3 caractères",
  }),
  stock: Joi.number().integer().min(0).optional(),
  inStock: Joi.boolean().optional(),
});

module.exports = productSchema;
