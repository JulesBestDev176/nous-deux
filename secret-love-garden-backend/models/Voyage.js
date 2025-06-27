// models/Voyage.js
const mongoose = require('mongoose');

const souvenirSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  date: Date,
  lieu: String,
  adresse: String,
  images: [{
    url: String,
    legende: String
  }],
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

const voyageSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'La destination est requise'],
    trim: true
  },
  description: String,
  adresse: String,
  dateDebut: Date,
  dateFin: Date,
  statut: {
    type: String,
    enum: ['planifie', 'en_cours', 'termine', 'annule'],
    default: 'planifie'
  },
  coordonnees: {
    latitude: Number,
    longitude: Number
  },
  budget: {
    prevu: Number,
    reel: Number,
    devise: {
      type: String,
      default: 'EUR'
    }
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
  images: [{
    url: String,
    legende: String
  }],
  souvenirs: [souvenirSchema],
  notes: String,
  evaluation: {
    type: Number,
    min: 1,
    max: 5
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Voyage', voyageSchema);