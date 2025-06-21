const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

// Initialisation manuelle (optionnelle, car maintenant automatique)
exports.initialisation = async (req, res) => {
  try {
    const utilisateursExistants = await Utilisateur.find();
    if (utilisateursExistants.length > 0) {
      return res.status(400).json({
        succes: false,
        message: 'Les comptes sont déjà initialisés'
      });
    }

    // Créer les utilisateurs avec codes bruts (le modèle les hachera automatiquement)
    const souleymane = new Utilisateur({
      nom: 'Souleymane Fall',
      code: '16092001',
      codePartenaire: '15062005'
    });

    const hadiyatou = new Utilisateur({
      nom: 'Hadiyatou Diallo',
      code: '15062005',
      codePartenaire: '16092001'
    });

    await souleymane.save();
    await hadiyatou.save();

    res.status(201).json({
      succes: true,
      message: 'Comptes initialisés avec succès'
    });
  } catch (erreur) {
    console.error('Erreur initialisation manuelle:', erreur);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de l\'initialisation'
    });
  }
};

// Connexion
exports.connexion = async (req, res) => {
  const { code } = req.body;
  
  try {
    // Trouver tous les utilisateurs
    const utilisateurs = await Utilisateur.find();
    
    let utilisateurTrouve = null;
    
    // Tester le code avec chaque utilisateur
    for (const utilisateur of utilisateurs) {
      const codeValide = await bcrypt.compare(code, utilisateur.code);
      
      if (codeValide) {
        utilisateurTrouve = utilisateur;
        break;
      }
    }

    if (!utilisateurTrouve) {
      return res.status(401).json({
        succes: false,
        message: 'Code incorrect'
      });
    }

    // Créer le token
    const token = jwt.sign(
      { id: utilisateurTrouve._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res
    .cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
    })
    .status(200)
    .json({
      success: true,
      token, // Pour le localStorage
      user: {
        id: utilisateurTrouve._id,
        name: utilisateurTrouve.nom
      }
    });
  } catch (erreur) {
    console.error('❌ Erreur connexion:', erreur);
    res.status(500).json({
      succes: false,
      message: 'Erreur lors de la connexion'
    });
  }
};

exports.verifierSession = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.utilisateur._id).select('-code');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Session invalide'
    });
  }
};

// Déconnexion
exports.deconnexion = async (req, res) => {
  res.status(200).json({
    succes: true,
    message: 'Déconnecté avec succès'
  });
};