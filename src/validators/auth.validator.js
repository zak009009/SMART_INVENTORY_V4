const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Adresse email invalide",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Le mot de passe doit contenir au moins 6 caractères",
  }),
  role: Joi.string().valid("user", "admin").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
