const mongoose = require('mongoose');

const partieSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['quiz', 'defi', 'compatibilite', 'quiz-couple', 'dilemmes', 'plus-probable'],
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    reponseUtilisateur1: String,
    reponseUtilisateur2: String,
    reponseCorrecte: String, // Peut être utilisé pour des quiz plus complexes
    points: {
      type: Number,
      default: 0
    }
  }],
  scores: {
    utilisateur1: {
      utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
      },
      score: {
        type: Number,
        default: 0
      }
    },
    utilisateur2: {
      utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
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

// Index pour améliorer les performances des requêtes
partieSchema.index({ 'scores.utilisateur1.utilisateur': 1 });
partieSchema.index({ 'scores.utilisateur2.utilisateur': 1 });
partieSchema.index({ statut: 1 });
partieSchema.index({ dateCreation: -1 });

module.exports = mongoose.model('Jeu', partieSchema);