// models/Evenement.js
const mongoose = require('mongoose');

const evenementSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dateTime: {
    type: Date,
    required: [true, 'La date est requise']
  },
  type: {
    type: String,
    enum: ['anniversaire', 'rendez_vous', 'voyage', 'restaurant', 'cinema', 'sport', 'famille', 'travail', 'special'],
    default: 'rendez_vous'
  },
  lieu: {
    type: String,
    trim: true
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
  rappels: [{
    type: {
      type: String,
      enum: ['notification', 'email'],
      default: 'notification'
    },
    tempsAvant: {
      type: Number, // en minutes
      default: 60
    },
    envoye: {
      type: Boolean,
      default: false
    }
  }],
  recurrence: {
    type: String,
    enum: ['aucune', 'quotidienne', 'hebdomadaire', 'mensuelle', 'annuelle'],
    default: 'aucune'
  },
  statut: {
    type: String,
    enum: ['planifie', 'confirme', 'annule', 'reporte'],
    default: 'planifie'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Evenement', evenementSchema);













