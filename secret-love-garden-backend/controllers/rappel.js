const Rappel = require('../models/Rappel');
const Utilisateur = require('../models/Utilisateur');
const upload = require('../utils/upload');

// Créer un nouveau rappel
exports.creerRappel = async (req, res) => {
  try {
    const { titre, description, contenu, dateRappel, priorite, type } = req.body;

    // Trouver le partenaire
    const partenaire = await Utilisateur.findOne({ 
      _id: { $ne: req.utilisateur.id } 
    });

    if (!partenaire) {
      return res.status(404).json({ 
        success: false,
        message: 'Partenaire non trouvé' 
      });
    }

    // Traiter les images si présentes
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: file.path,
        legende: file.originalname
      }));
    }

    const rappel = await Rappel.create({
      titre,
      description,
      contenu,
      dateRappel: new Date(dateRappel),
      priorite: priorite || 'normale',
      type: type || 'texte',
      images,
      createur: req.utilisateur.id,
      partenaire: partenaire._id
    });

    res.status(201).json({
      success: true,
      data: rappel
    });

  } catch (error) {
    console.error('Erreur création rappel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rappel'
    });
  }
};

// Obtenir tous les rappels de l'utilisateur
exports.getRappels = async (req, res) => {
  try {
    const rappels = await Rappel.find({
      $or: [
        { createur: req.utilisateur.id },
        { partenaire: req.utilisateur.id }
      ]
    })
    .populate('createur', 'nom')
    .populate('partenaire', 'nom')
    .sort({ dateRappel: 1 });

    res.status(200).json({
      success: true,
      count: rappels.length,
      data: rappels
    });

  } catch (error) {
    console.error('Erreur récupération rappels:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rappels'
    });
  }
};

// Modifier le statut d'un rappel
exports.modifierStatutRappel = async (req, res) => {
  try {
    const { rappelId } = req.params;
    const { statut } = req.body;

    const rappel = await Rappel.findOneAndUpdate(
      { 
        _id: rappelId,
        $or: [
          { createur: req.utilisateur.id },
          { partenaire: req.utilisateur.id }
        ]
      },
      { statut },
      { new: true }
    );

    if (!rappel) {
      return res.status(404).json({
        success: false,
        message: 'Rappel non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: rappel
    });

  } catch (error) {
    console.error('Erreur modification statut rappel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut'
    });
  }
};

// Supprimer un rappel
exports.supprimerRappel = async (req, res) => {
  try {
    const { rappelId } = req.params;

    const rappel = await Rappel.findOneAndDelete({
      _id: rappelId,
      createur: req.utilisateur.id // Seul le créateur peut supprimer
    });

    if (!rappel) {
      return res.status(404).json({
        success: false,
        message: 'Rappel non trouvé ou non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rappel supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression rappel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du rappel'
    });
  }
}; 