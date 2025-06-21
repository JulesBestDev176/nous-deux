const mongoose = require('mongoose');

const rappelSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['texte', 'image', 'mixte'],
    default: 'texte'
  },
  contenu: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    legende: String
  }],
  dateRappel: {
    type: Date,
    required: true
  },
  priorite: {
    type: String,
    enum: ['basse', 'normale', 'haute', 'urgente'],
    default: 'normale'
  },
  statut: {
    type: String,
    enum: ['actif', 'termine', 'annule'],
    default: 'actif'
  },
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
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Rappel', rappelSchema); 