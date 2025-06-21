// Créer utils/validationSchemas.js
const Joi = require('joi');

module.exports = {
  reponse: Joi.object({
    questionId: Joi.string().hex().length(24).required(),
    texte: Joi.string().min(1).max(500).required()
  })
};