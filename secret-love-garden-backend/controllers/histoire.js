const Histoire = require('../models/Histoire');
const Gallerie = require('../models/Gallerie');
const Reponse = require('../models/Reponse');
const Utilisateur = require('../models/Utilisateur');

exports.genererHistoire = async (req, res) => {
  try {
    // Trouver le partenaire (l'autre utilisateur)
    const partenaire = await Utilisateur.findOne({ 
      _id: { $ne: req.utilisateur.id } 
    });

    if (!partenaire) {
      return res.status(404).json({ 
        success: false,
        message: 'Partenaire non trouvé' 
      });
    }

    // Choisir aléatoirement le type de contenu
    const type = Math.random() > 0.5 ? 'photo' : 'question';
    let contenu = null;

    if (type === 'photo') {
      contenu = await Gallerie.findOne({ 
        createur: partenaire._id 
      }).sort({ dateCreation: -1 });
    } else {
      contenu = await Reponse.findOne({ 
        utilisateur: partenaire._id 
      })
      .populate('question')
      .sort({ dateReponse: -1 });
    }

    if (!contenu) {
      return res.status(404).json({ 
        success: false,
        message: 'Aucun contenu disponible' 
      });
    }

    // Créer l'entrée d'histoire
    const elementHistoire = await Histoire.create({
      type,
      photo: type === 'photo' ? contenu._id : null,
      question: type === 'question' ? contenu.question._id : null,
      reponse: type === 'question' ? contenu._id : null,
      partenaire: partenaire._id,
      message: type === 'photo' 
        ? (contenu.legende || 'Souvenir partagé') 
        : 'Réponse à une question',
      createur: partenaire._id
    });

    res.status(200).json({
      success: true,
      data: await Histoire.populate(elementHistoire, [
        { path: 'photo', select: 'url legende' },
        { path: 'question', select: 'texte' },
        { path: 'reponse', select: 'texte' },
        { path: 'partenaire', select: 'nom' }
      ])
    });

  } catch (error) {
    console.error('Erreur génération histoire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du contenu'
    });
  }
};

exports.getHistorique = async (req, res) => {
  try {
    const historique = await Histoire.find()
      .populate({
        path: 'photo',
        select: 'url legende'
      })
      .populate('question', 'texte')
      .populate('reponse', 'texte dateReponse')
      .populate('partenaire', 'nom')
      .sort({ dateCreation: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: historique.length,
      data: historique
    });

  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};