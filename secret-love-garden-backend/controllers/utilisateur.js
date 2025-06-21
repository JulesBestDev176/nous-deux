const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcryptjs');

// Modifier le code utilisateur
exports.modifierCode = async (req, res) => {
  try {
    const { ancienCode, nouveauCode } = req.body;
    const utilisateur = await Utilisateur.findById(req.utilisateur.id);

    // Vérifier l'ancien code
    const codeValide = await bcrypt.compare(ancienCode, utilisateur.code);
    if (!codeValide) {
      return res.status(400).json({ message: 'Ancien code incorrect' });
    }

    // Mettre à jour le code
    utilisateur.code = nouveauCode;
    await utilisateur.save();

    res.json({ message: 'Code modifié avec succès' });
  } catch (erreur) {
    res.status(500).json({ message: erreur.message });
  }
};

// Obtenir le profil
exports.getProfil = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.utilisateur.id)
      .select('-code -codePartenaire');
    res.json(utilisateur);
  } catch (erreur) {
    res.status(500).json({ message: erreur.message });
  }
};

// Obtenir le partenaire
exports.getPartenaire = async (req, res) => {
  try {
    const partenaire = await Utilisateur.findOne({ 
      _id: { $ne: req.utilisateur.id } 
    }).select('-code -codePartenaire');
    
    if (!partenaire) {
      return res.status(404).json({ 
        success: false,
        message: 'Partenaire non trouvé' 
      });
    }

    res.json({
      success: true,
      data: partenaire
    });
  } catch (erreur) {
    res.status(500).json({ 
      success: false,
      message: erreur.message 
    });
  }
};