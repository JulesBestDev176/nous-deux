const mongoose = require('mongoose');

const defiSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  difficulte: { type: String, enum: ['Facile', 'Moyen', 'Difficile'], required: true },
  categorie: { type: String, required: true },
  icon: { type: String, required: true },
  actif: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Defi', defiSchema);