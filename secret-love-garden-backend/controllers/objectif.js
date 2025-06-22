// controllers/objectif.js
const Objectif = require('../models/Objectif');
const Utilisateur = require('../models/Utilisateur');

// Créer un nouvel objectif
exports.creerObjectif = async (req, res) => {
  try {
    const { titre, description, categorie, priorite, dateObjectif } = req.body;

    
    const partenaire = await Utilisateur.findOne({ 
      _id: { $ne: req.utilisateur.id } 
    });

    if (!partenaire) {
      return res.status(404).json({ 
        success: false,
        message: 'Partenaire non trouvé' 
      });
    }

    const objectif = await Objectif.create({
      titre,
      description,
      categorie: categorie || 'personnel',
      priorite: priorite || 'normale',
      dateObjectif: dateObjectif ? new Date(dateObjectif) : null,
      createur: req.utilisateur.id,
      partenaire: partenaire._id
    });

    await objectif.populate('createur', 'nom');

    res.status(201).json({
      success: true,
      data: objectif
    });

  } catch (error) {
    console.error('Erreur création objectif:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'objectif'
    });
  }
};

// Obtenir tous les objectifs
exports.getObjectifs = async (req, res) => {
  try {
    const { statut, categorie } = req.query;
    let filter = {
      $or: [
        { createur: req.utilisateur.id },
        { partenaire: req.utilisateur.id }
      ]
    };

    if (statut) filter.statut = statut;
    if (categorie) filter.categorie = categorie;

    const objectifs = await Objectif.find(filter)
      .populate('createur', 'nom')
      .populate('partenaire', 'nom')
      .sort({ dateCreation: -1 });

    res.status(200).json({
      success: true,
      count: objectifs.length,
      data: objectifs
    });

  } catch (error) {
    console.error('Erreur récupération objectifs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des objectifs'
    });
  }
};

// Modifier la progression d'un objectif
exports.modifierProgression = async (req, res) => {
  try {
    const { objectifId } = req.params;
    const { progression } = req.body;

    if (progression < 0 || progression > 100) {
      return res.status(400).json({
        success: false,
        message: 'La progression doit être entre 0 et 100'
      });
    }

    const objectif = await Objectif.findOne({
      _id: objectifId,
      $or: [
        { createur: req.utilisateur.id },
        { partenaire: req.utilisateur.id }
      ]
    });

    if (!objectif) {
      return res.status(404).json({
        success: false,
        message: 'Objectif non trouvé'
      });
    }

    objectif.progression = progression;
    
    // Si 100%, marquer comme terminé
    if (progression >= 100) {
      objectif.statut = 'termine';
    } else if (objectif.statut === 'en_attente') {
      objectif.statut = 'en_cours';
    }

    await objectif.save();

    res.status(200).json({
      success: true,
      data: objectif
    });

  } catch (error) {
    console.error('Erreur modification progression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la progression'
    });
  }
};

// Supprimer un objectif
exports.supprimerObjectif = async (req, res) => {
  try {
    const { objectifId } = req.params;

    const objectif = await Objectif.findOneAndDelete({
      _id: objectifId,
      createur: req.utilisateur.id // Seul le créateur peut supprimer
    });

    if (!objectif) {
      return res.status(404).json({
        success: false,
        message: 'Objectif non trouvé ou non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Objectif supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression objectif:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'objectif'
    });
  }
};