const mongoose = require('mongoose');

const reponseSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  texte: {
    type: String,
    required: [true, 'La réponse est requise'],
    trim: true
  },
  dateReponse: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reponse', reponseSchema);