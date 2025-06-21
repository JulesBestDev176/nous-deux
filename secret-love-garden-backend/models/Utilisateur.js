const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  codePartenaire: {
    type: String,
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour hacher le code avant de sauvegarder
utilisateurSchema.pre('save', async function(next) {
  if (!this.isModified('code')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.code = await bcrypt.hash(this.code, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema);