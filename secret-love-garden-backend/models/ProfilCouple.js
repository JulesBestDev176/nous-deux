// models/ProfilCouple.js
const mongoose = require('mongoose');

const resultatTestSchema = new mongoose.Schema({
  typeTest: {
    type: String,
    enum: ['compatibilite', 'love-languages', 'personnalite'],
    required: true
  },
  reponses: [mongoose.Schema.Types.Mixed],
  score: Number,
  interpretation: String,
  conseils: [String],
  dateTest: {
    type: Date,
    default: Date.now
  }
});

const profilCoupleSchema = new mongoose.Schema({
  utilisateur1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  utilisateur2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  dateRencontre: Date,
  dateDebutRelation: Date,
  statusRelation: {
    type: String,
    enum: ['rencontre', 'couple', 'fiances', 'maries', 'pacs'],
    default: 'couple'
  },
  compatibilite: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    domaines: [{
      nom: String,
      score: Number,
      description: String
    }]
  },
  langagesAmour: {
    utilisateur1: {
      principal: String,
      secondaire: String,
      scores: {
        mots: Number,
        contact: Number,
        cadeaux: Number,
        services: Number,
        temps: Number
      }
    },
    utilisateur2: {
      principal: String,
      secondaire: String,
      scores: {
        mots: Number,
        contact: Number,
        cadeaux: Number,
        services: Number,
        temps: Number
      }
    }
  },
  pointsForts: [String],
  pointsAmeliorer: [String],
  objectifsCommuns: [String],
  resultatsTests: [resultatTestSchema],
  preferences: {
    activitesFavorites: [String],
    lieuxFavoris: [String],
    rituels: [String]
  },
  anniversaires: [{
    nom: String,
    date: Date,
    type: {
      type: String,
      enum: ['rencontre', 'couple', 'fiancailles', 'mariage', 'autre']
    },
    description: String
  }],
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProfilCouple', profilCoupleSchema);