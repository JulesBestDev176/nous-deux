// controllers/calendrier.js
const Evenement = require('../models/Evenement');
const Utilisateur = require('../models/Utilisateur');

// Créer un nouvel événement
exports.creerEvenement = async (req, res) => {
  try {
    const { titre, description, dateTime, type, lieu, rappels, recurrence } = req.body;

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

    const evenement = await Evenement.create({
      titre,
      description,
      dateTime: new Date(dateTime),
      type: type || 'rendez_vous',
      lieu,
      rappels: rappels || [],
      recurrence: recurrence || 'aucune',
      createur: req.utilisateur.id,
      partenaire: partenaire._id
    });

    await evenement.populate('createur', 'nom');

    res.status(201).json({
      success: true,
      data: evenement
    });

  } catch (error) {
    console.error('Erreur création événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement'
    });
  }
};

// Obtenir tous les événements
exports.getEvenements = async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = {
      $or: [
        { createur: req.utilisateur.id },
        { partenaire: req.utilisateur.id }
      ]
    };

    // Filtrer par mois/année si spécifié
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.dateTime = { $gte: startDate, $lte: endDate };
    }

    const evenements = await Evenement.find(filter)
      .populate('createur', 'nom')
      .populate('partenaire', 'nom')
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      count: evenements.length,
      data: evenements
    });

  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements'
    });
  }
};

// Modifier un événement
exports.modifierEvenement = async (req, res) => {
  try {
    const { evenementId } = req.params;
    const updates = req.body;

    const evenement = await Evenement.findOneAndUpdate(
      { 
        _id: evenementId,
        $or: [
          { createur: req.utilisateur.id },
          { partenaire: req.utilisateur.id }
        ]
      },
      updates,
      { new: true }
    ).populate('createur', 'nom');

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: evenement
    });

  } catch (error) {
    console.error('Erreur modification événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'événement'
    });
  }
};

// Supprimer un événement
exports.supprimerEvenement = async (req, res) => {
  try {
    const { evenementId } = req.params;

    const evenement = await Evenement.findOneAndDelete({
      _id: evenementId,
      createur: req.utilisateur.id // Seul le créateur peut supprimer
    });

    if (!evenement) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé ou non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Événement supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'événement'
    });
  }
};







