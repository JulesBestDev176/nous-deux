// models/Jeu.js
const mongoose = require('mongoose');

const partieSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['quiz', 'defi', 'compatibilite'],
    required: true
  },
  questions: [{
    question: String,
    reponseUtilisateur1: String,
    reponseUtilisateur2: String,
    reponseCorrecte: String,
    points: {
      type: Number,
      default: 0
    }
  }],
  scores: {
    utilisateur1: {
      utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur'
      },
      score: {
        type: Number,
        default: 0
      }
    },
    utilisateur2: {
      utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur'
      },
      score: {
        type: Number,
        default: 0
      }
    }
  },
  statut: {
    type: String,
    enum: ['en_attente', 'en_cours', 'termine'],
    default: 'en_attente'
  },
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateFin: Date
});
module.exports = mongoose.model('Jeu', partieSchema);