// controllers/voyage.js
const Voyage = require('../models/Voyage');
const Utilisateur = require('../models/Utilisateur');
const upload = require('../utils/upload');

// Créer un nouveau voyage
exports.creerVoyage = async (req, res) => {
  try {
    const { 
      titre, 
      destination, 
      description, 
      dateDebut, 
      dateFin, 
      coordonnees, 
      budget 
    } = req.body;

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

    const voyage = await Voyage.create({
      titre,
      destination,
      description,
      dateDebut: dateDebut ? new Date(dateDebut) : null,
      dateFin: dateFin ? new Date(dateFin) : null,
      coordonnees,
      budget,
      images,
      createur: req.utilisateur.id,
      partenaire: partenaire._id
    });

    await voyage.populate('createur', 'nom');

    res.status(201).json({
      success: true,
      data: voyage
    });

  } catch (error) {
    console.error('Erreur création voyage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du voyage'
    });
  }
};

// Obtenir tous les voyages
exports.getVoyages = async (req, res) => {
  try {
    const { statut } = req.query;
    let filter = {
      $or: [
        { createur: req.utilisateur.id },
        { partenaire: req.utilisateur.id }
      ]
    };

    if (statut) {
      filter.statut = statut;
    }

    const voyages = await Voyage.find(filter)
      .populate('createur', 'nom')
      .populate('partenaire', 'nom')
      .sort({ dateCreation: -1 });

    res.status(200).json({
      success: true,
      count: voyages.length,
      data: voyages
    });

  } catch (error) {
    console.error('Erreur récupération voyages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des voyages'
    });
  }
};

// Ajouter un souvenir à un voyage
exports.ajouterSouvenir = async (req, res) => {
  try {
    const { voyageId } = req.params;
    const { titre, description, date, lieu } = req.body;

    // Traiter les images si présentes
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: file.path,
        legende: file.originalname
      }));
    }

    const voyage = await Voyage.findOne({
      _id: voyageId,
      $or: [
        { createur: req.utilisateur.id },
        { partenaire: req.utilisateur.id }
      ]
    });

    if (!voyage) {
      return res.status(404).json({
        success: false,
        message: 'Voyage non trouvé'
      });
    }

    const souvenir = {
      titre,
      description,
      date: date ? new Date(date) : new Date(),
      lieu,
      images,
      createur: req.utilisateur.id
    };

    voyage.souvenirs.push(souvenir);
    await voyage.save();

    res.status(201).json({
      success: true,
      data: souvenir
    });

  } catch (error) {
    console.error('Erreur ajout souvenir:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du souvenir'
    });
  }
};

// Modifier un voyage
exports.modifierVoyage = async (req, res) => {
  try {
    const { voyageId } = req.params;
    const updates = req.body;

    const voyage = await Voyage.findOneAndUpdate(
      { 
        _id: voyageId,
        $or: [
          { createur: req.utilisateur.id },
          { partenaire: req.utilisateur.id }
        ]
      },
      updates,
      { new: true }
    ).populate('createur', 'nom');

    if (!voyage) {
      return res.status(404).json({
        success: false,
        message: 'Voyage non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: voyage
    });

  } catch (error) {
    console.error('Erreur modification voyage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du voyage'
    });
  }
};

// Supprimer un voyage
exports.supprimerVoyage = async (req, res) => {
  try {
    const { voyageId } = req.params;

    const voyage = await Voyage.findOneAndDelete({
      _id: voyageId,
      createur: req.utilisateur.id // Seul le créateur peut supprimer
    });

    if (!voyage) {
      return res.status(404).json({
        success: false,
        message: 'Voyage non trouvé ou non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Voyage supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression voyage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du voyage'
    });
  }
};