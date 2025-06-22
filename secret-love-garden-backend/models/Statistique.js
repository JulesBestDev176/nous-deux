// models/Statistique.js
const mongoose = require('mongoose');

const statistiqueSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  humeur: {
    niveau: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    commentaire: String,
    activite: String
  },
  activites: [{
    nom: String,
    duree: Number, // en minutes
    satisfaction: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  tempsEnsemble: {
    type: Number, // en heures
    default: 0
  },
  messagesEnvoyes: {
    type: Number,
    default: 0
  },
  messagesRecus: {
    type: Number,
    default: 0
  },
  photosPartagees: {
    type: Number,
    default: 0
  },
  questionsRepondues: {
    type: Number,
    default: 0
  }
});

// Index pour optimiser les requêtes
statistiqueSchema.index({ utilisateur: 1, date: -1 });

module.exports = mongoose.model('Statistique', statistiqueSchema);