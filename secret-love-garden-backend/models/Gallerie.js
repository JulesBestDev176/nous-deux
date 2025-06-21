const mongoose = require('mongoose');

const gallerieSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'L\'URL de l\'image est requise']
  },
  legende: {
    type: String,
    trim: true,
    maxlength: [150, 'La légende ne peut dépasser 150 caractères']
  },
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Gallerie', gallerieSchema);