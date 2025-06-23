const mongoose = require('mongoose');

const questionJeuSchema = new mongoose.Schema({
  typeJeu: { type: String, required: true, index: true },
  questionText: { type: String, required: true },
  optionA: { type: String }, // Pour les questions "tu préfères"
  optionB: { type: String }, // Pour les questions "tu préfères"
  points: { type: Number, default: 10 },
  difficulte: { type: String, enum: ['Facile', 'Moyen', 'Difficile', 'Pro'] },
  categorie: { type: String },
  actif: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Index composé pour optimiser les requêtes
questionJeuSchema.index({ typeJeu: 1, actif: 1 });
questionJeuSchema.index({ typeJeu: 1, difficulte: 1 });

module.exports = mongoose.model('QuestionJeu', questionJeuSchema);