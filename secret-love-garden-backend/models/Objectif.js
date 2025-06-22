// models/Objectif.js
const mongoose = require('mongoose');

const objectifSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  categorie: {
    type: String,
    enum: ['personnel', 'voyage', 'maison', 'sante', 'financier', 'carriere', 'loisir'],
    default: 'personnel'
  },
  priorite: {
    type: String,
    enum: ['faible', 'normale', 'haute'],
    default: 'normale'
  },
  statut: {
    type: String,
    enum: ['en_attente', 'en_cours', 'termine', 'annule'],
    default: 'en_attente'
  },
  progression: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  dateObjectif: Date,
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  partenaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  jalons: [{
    titre: String,
    description: String,
    dateAtteinte: Date,
    atteint: {
      type: Boolean,
      default: false
    }
  }],
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Objectif', objectifSchema);