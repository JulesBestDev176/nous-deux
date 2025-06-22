// controllers/message.js
const Message = require('../models/Message');
const Utilisateur = require('../models/Utilisateur');

// Citations romantiques prédéfinies
const citations = [
  {
    texte: "L'amour est la poésie des sens.",
    auteur: "Honoré de Balzac"
  },
  {
    texte: "Aimer, ce n'est pas se regarder l'un l'autre, c'est regarder ensemble dans la même direction.",
    auteur: "Antoine de Saint-Exupéry"
  }
];

// Envoyer un message
exports.envoyerMessage = async (req, res) => {
  try {
    const { contenu, type, programme, dateProgrammee, images, citationId } = req.body;

    // Trouver le destinataire (partenaire)
    const destinataire = await Utilisateur.findOne({ 
      _id: { $ne: req.utilisateur.id } 
    });

    if (!destinataire) {
      return res.status(404).json({ 
        success: false,
        message: 'Destinataire non trouvé' 
      });
    }

    let citation = null;
    if (citationId && citations[citationId]) {
      citation = citations[citationId];
    }

    const message = await Message.create({
      expediteur: req.utilisateur.id,
      destinataire: destinataire._id,
      contenu,
      type: type || 'quotidien',
      programme: programme || false,
      dateProgrammee: dateProgrammee ? new Date(dateProgrammee) : null,
      images: images || [],
      citation
    });

    await message.populate('expediteur', 'nom');

    res.status(201).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
};

// Obtenir les messages
exports.getMessages = async (req, res) => {
  try {
    const { type } = req.query;
    let filter = {
      $or: [
        { expediteur: req.utilisateur.id },
        { destinataire: req.utilisateur.id }
      ]
    };

    if (type) {
      filter.type = type;
    }

    const messages = await Message.find(filter)
      .populate('expediteur', 'nom')
      .populate('destinataire', 'nom')
      .sort({ dateEnvoi: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};

// Marquer un message comme lu
exports.marquerCommeLu = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOneAndUpdate(
      { 
        _id: messageId,
        destinataire: req.utilisateur.id
      },
      { 
        statut: 'lu',
        dateLecture: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Erreur marquage lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage comme lu'
    });
  }
};

// Obtenir les citations
exports.getCitations = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: citations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des citations'
    });
  }
};