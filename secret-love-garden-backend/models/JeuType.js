const mongoose = require('mongoose');

const subQuizSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nom: { type: String, required: true },
  description: { type: String, required: true },
  difficulte: { type: String, enum: ['Facile', 'Moyen', 'Difficile', 'Pro'], required: true },
  duree: { type: String, required: true },
  maxQuestions: { type: Number, required: true }
}, { _id: false });

const jeuTypeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  difficulte: { type: String, required: true },
  duree: { type: String, required: true },
  needsCorrection: { type: Boolean, default: false },
  hasSubQuizzes: { type: Boolean, default: false },
  subQuizzes: [subQuizSchema],
  minQuestions: { type: Number, default: 6 },
  maxQuestions: { type: Number, default: 10 },
  actif: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('JeuType', jeuTypeSchema);