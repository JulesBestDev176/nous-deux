const Histoire = require('../models/Histoire');
const Gallerie = require('../models/Gallerie');
const Reponse = require('../models/Reponse');
const Utilisateur = require('../models/Utilisateur');
const Message = require('../models/Message');
const Evenement = require('../models/Evenement');
const Objectif = require('../models/Objectif');

exports.getHistorique = async (req, res) => {
  try {
    const utilisateurConnecte = await Utilisateur.findById(req.utilisateur.id);
    if (!utilisateurConnecte || !utilisateurConnecte.partenaire) {
      return res.status(404).json({ success: false, message: 'Utilisateur ou partenaire non trouvé' });
    }
    const partenaireId = utilisateurConnecte.partenaire;
    const coupleIds = [utilisateurConnecte._id, partenaireId];

    // 1. Récupérer les différents types d'événements
    const messages = await Message.find({ $or: [{ expediteur: { $in: coupleIds } }, { destinataire: { $in: coupleIds } }] })
      .populate('expediteur', 'nom')
      .lean()
      .then(docs => docs.map(d => ({ ...d, type: 'message', date: d.dateEnvoi })));

    const photos = await Gallerie.find({ createur: { $in: coupleIds } })
      .populate('createur', 'nom')
      .lean()
      .then(docs => docs.map(d => ({ ...d, type: 'photo', date: d.dateCreation })));

    const reponses = await Reponse.find({ utilisateur: { $in: coupleIds } })
      .populate('utilisateur', 'nom')
      .populate('question', 'texte')
      .lean()
      .then(docs => docs.map(d => ({ ...d, type: 'reponse_question', date: d.dateReponse })));
      
    const evenementsCalendrier = await Evenement.find({ createur: { $in: coupleIds } })
        .populate('createur', 'nom')
        .lean()
        .then(docs => docs.map(d => ({ ...d, type: 'evenement', date: d.date })));
        
    const objectifsAtteints = await Objectif.find({ createur: { $in: coupleIds }, statut: 'termine' })
        .populate('createur', 'nom')
        .lean()
        .then(docs => docs.map(d => ({ ...d, type: 'objectif_atteint', date: d.dateCreation }))); // ou une autre date si pertinent

    // 2. Fusionner et trier tous les événements
    const timeline = [
      ...messages,
      ...photos,
      ...reponses,
      ...evenementsCalendrier,
      ...objectifsAtteints
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: timeline.length,
      data: timeline
    });

  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// La fonction genererHistoire peut être supprimée ou mise en commentaire si elle n'est plus utilisée
// exports.genererHistoire = ...