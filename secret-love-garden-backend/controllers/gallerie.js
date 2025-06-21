const Gallerie = require('../models/Gallerie');
const Histoire = require('../models/Histoire');
const Utilisateur = require('../models/Utilisateur');
const { protegerRoutes } = require('../middlewares/auth');
const upload = require('../utils/upload');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image fournie'
      });
    }

    // Création de l'image
    const image = await Gallerie.create({
      url: req.file.path,
      legende: req.body.legende,
      createur: req.utilisateur.id
    });

    // Trouver l'autre utilisateur (partenaire)
    const partenaire = await Utilisateur.findOne({ 
      _id: { $ne: req.utilisateur.id } 
    });

    if (!partenaire) {
      return res.status(404).json({
        success: false,
        message: 'Partenaire non trouvé'
      });
    }

    // Création de l'entrée d'histoire
    await Histoire.create({
      type: 'photo',
      photo: image._id,
      partenaire: partenaire._id,
      message: req.body.legende || 'Nouveau souvenir partagé',
      createur: req.utilisateur.id
    });

    res.status(201).json({
      success: true,
      data: {
        _id: image._id,
        url: image.url,
        legende: image.legende,
        dateCreation: image.dateCreation
      }
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de l\'image'
    });
  }
};

exports.getImages = async (req, res) => {
  try {
    const images = await Gallerie.find()
      .populate('createur', 'nom')
      .sort({ dateCreation: -1 });

    res.status(200).json({
      success: true,
      count: images.length,
      data: images.map(img => ({
        _id: img._id,
        url: img.url,
        legende: img.legende,
        createur: img.createur,
        dateCreation: img.dateCreation
      }))
    });
  } catch (error) {
    console.error('Erreur récupération images:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des images'
    });
  }
};