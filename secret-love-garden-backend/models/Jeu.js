const mongoose = require('mongoose');

const questionJeuSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  points: { type: Number, default: 10 },
  
  // Pour les quiz couple: chaque question a 2 instances
  // Instance 1: Utilisateur1 répond sur Utilisateur2, Utilisateur2 corrige
  // Instance 2: Utilisateur2 répond sur Utilisateur1, Utilisateur1 corrige
  
  // Qui doit donner la vraie réponse (celui sur qui porte la question)
  sujet: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  reponseSujet: { type: String, default: '' },
  reponduParSujet: { type: Boolean, default: false },

  // Qui doit deviner la réponse 
  devineur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  reponseDevineur: { type: String, default: '' },
  reponduParDevineur: { type: Boolean, default: false },
  
  // Statut de la correction
  estCorrect: { type: Boolean, default: null }, // null = non évalué, true/false après évaluation
  corrigePar: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', default: null },
  dateCorrection: { type: Date, default: null }
}, { _id: false });

// Schéma pour les questions simples (sans correction)
const questionSimpleSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  optionA: { type: String }, // Pour les questions "tu préfères"
  optionB: { type: String }, // Pour les questions "tu préfères"
  points: { type: Number, default: 5 },
  
  // Réponses des joueurs
  reponseUtilisateur1: { type: String, default: '' },
  reponseUtilisateur2: { type: String, default: '' },
  
  // Statut
  reponduParUtilisateur1: { type: Boolean, default: false },
  reponduParUtilisateur2: { type: Boolean, default: false }
}, { _id: false });

const partieSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'quiz-couple', 
      'dilemmes', 
      'plus-probable', 
      'preferences', 
      'tu-preferes', 
      'memory-souvenirs', 
      'association-mots', 
      'devine-emotion', 
      'reactions', 
      'secrets-desires'
    ],
    required: true
  },
  
  // ID du sous-quiz pour les quiz couple
  subQuizId: {
    type: String,
    default: null
  },
  
  // Questions avec correction (pour quiz-couple, memory-souvenirs, devine-emotion, secrets-desires)
  questions: [questionJeuSchema],
  
  // Questions simples (pour dilemmes, plus-probable, preferences, tu-preferes, association-mots, reactions)
  questionsSimples: [questionSimpleSchema],
  
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
    enum: ['en_cours', 'termine', 'abandonne'],
    default: 'en_cours'
  },
  
  tourActuel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  
  // Métadonnées du jeu
  nombreQuestions: { type: Number, required: true },
  questionsTerminees: { type: Number, default: 0 },
  
  dateCreation: {
    type: Date,
    default: Date.now
  },
  
  dateFin: { type: Date },
  
  // Statistiques
  tempsJeu: { type: Number, default: 0 }, // en secondes
  correctionsEnAttente: { type: Number, default: 0 }
});

// Index pour améliorer les performances des requêtes
partieSchema.index({ 'scores.utilisateur1.utilisateur': 1 });
partieSchema.index({ 'scores.utilisateur2.utilisateur': 1 });
partieSchema.index({ statut: 1 });
partieSchema.index({ dateCreation: -1 });
partieSchema.index({ type: 1 });
partieSchema.index({ createur: 1 });

// Méthodes du schéma
partieSchema.methods.getProgressPercentage = function() {
  return Math.round((this.questionsTerminees / this.nombreQuestions) * 100);
};

partieSchema.methods.isQuestionnaireComplete = function() {
  if (this.questions.length > 0) {
    return this.questions.every(q => q.reponduParSujet && q.reponduParDevineur);
  }
  if (this.questionsSimples.length > 0) {
    return this.questionsSimples.every(q => q.reponduParUtilisateur1 && q.reponduParUtilisateur2);
  }
  return false;
};

partieSchema.methods.getNombreCorrectionsEnAttente = function() {
  return this.questions.filter(q => 
    q.reponduParSujet && 
    q.reponduParDevineur && 
    q.estCorrect === null
  ).length;
};

partieSchema.methods.peutEtreTerminee = function() {
  const questionsCompletes = this.isQuestionnaireComplete();
  const correctionsTerminees = this.getNombreCorrectionsEnAttente() === 0;
  return questionsCompletes && (this.questions.length === 0 || correctionsTerminees);
};

// Middleware pre-save pour mettre à jour les statistiques
partieSchema.pre('save', function(next) {
  // Mettre à jour le nombre de corrections en attente
  this.correctionsEnAttente = this.getNombreCorrectionsEnAttente();
  
  // Mettre à jour le nombre de questions terminées
  if (this.questions.length > 0) {
    this.questionsTerminees = this.questions.filter(q => 
      q.reponduParSujet && q.reponduParDevineur && q.estCorrect !== null
    ).length;
  } else if (this.questionsSimples.length > 0) {
    this.questionsTerminees = this.questionsSimples.filter(q => 
      q.reponduParUtilisateur1 && q.reponduParUtilisateur2
    ).length;
  }
  
  // Vérifier si la partie peut être automatiquement terminée
  if (this.statut === 'en_cours' && this.peutEtreTerminee()) {
    this.statut = 'termine';
    this.dateFin = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Jeu', partieSchema);