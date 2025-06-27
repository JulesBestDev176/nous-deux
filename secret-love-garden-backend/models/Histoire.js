const mongoose = require('mongoose');

const histoireSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['question', 'photo'],
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  reponse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reponse'
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gallerie'
  },
  message: {
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
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Histoire', histoireSchema);