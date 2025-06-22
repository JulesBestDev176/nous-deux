// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  contenu: {
    type: String,
    required: [true, 'Le contenu est requis'],
    trim: true
  },
  type: {
    type: String,
    enum: ['surprise', 'encouragement', 'anniversaire', 'quotidien', 'excuse', 'gratitude', 'romantique'],
    default: 'quotidien'
  },
  statut: {
    type: String,
    enum: ['envoye', 'lu', 'archive'],
    default: 'envoye'
  },
  dateEnvoi: {
    type: Date,
    default: Date.now
  },
  dateLecture: Date,
  programme: {
    type: Boolean,
    default: false
  },
  dateProgrammee: Date,
  images: [{
    url: String,
    legende: String
  }],
  citation: {
    texte: String,
    auteur: String
  }
});

module.exports = mongoose.model('Message', messageSchema);