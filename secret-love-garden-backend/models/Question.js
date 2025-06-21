const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  texte: {
    type: String,
    required: [true, 'Le texte de la question est requis'],
    trim: true
  },
  categorie: {
    type: String,
    enum: ['systeme', 'utilisateur'],
    default: 'systeme'
  },
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateProgrammation: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Question', questionSchema);