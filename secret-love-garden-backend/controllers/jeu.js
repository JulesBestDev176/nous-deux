// controllers/jeu.js
const Jeu = require('../models/Jeu');
const Utilisateur = require('../models/Utilisateur');

// Questions prédéfinies pour les jeux
const questionsQuiz = [
  {
    question: "Quelle est la couleur préférée de votre partenaire ?",
    type: "ouverte"
  },
  {
    question: "Quel est le plat préféré de votre partenaire ?",
    type: "ouverte"
  },
  {
    question: "Dans quelle ville votre partenaire aimerait-il/elle vivre ?",
    type: "ouverte"
  }
];

// Créer une nouvelle partie
exports.creerPartie = async (req, res) => {
  try {
    const { type } = req.body;

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

    // Générer les questions selon le type
    let questions = [];
    if (type === 'quiz') {
      questions = questionsQuiz.map(q => ({
        question: q.question,
        reponseUtilisateur1: "",
        reponseUtilisateur2: "",
        points: 10
      }));
    }

    const partie = await Jeu.create({
      type,
      questions,
      scores: {
        utilisateur1: {
          utilisateur: req.utilisateur.id,
          score: 0
        },
        utilisateur2: {
          utilisateur: partenaire._id,
          score: 0
        }
      },
      createur: req.utilisateur.id
    });

    res.status(201).json({
      success: true,
      data: partie
    });

  } catch (error) {
    console.error('Erreur création partie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la partie'
    });
  }
};

// Répondre à une question
exports.repondreQuestion = async (req, res) => {
  try {
    const { partieId } = req.params;
    const { questionIndex, reponse } = req.body;

    const partie = await Jeu.findById(partieId);
    if (!partie) {
      return res.status(404).json({
        success: false,
        message: 'Partie non trouvée'
      });
    }

    // Déterminer si c'est l'utilisateur 1 ou 2
    const isUtilisateur1 = partie.scores.utilisateur1.utilisateur.toString() === req.utilisateur.id;
    const champReponse = isUtilisateur1 ? 'reponseUtilisateur1' : 'reponseUtilisateur2';

    // Mettre à jour la réponse
    partie.questions[questionIndex][champReponse] = reponse;
    
    // Changer le statut en cours si c'est la première réponse
    if (partie.statut === 'en_attente') {
      partie.statut = 'en_cours';
    }

    await partie.save();

    res.status(200).json({
      success: true,
      data: partie
    });

  } catch (error) {
    console.error('Erreur réponse question:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la réponse'
    });
  }
};

// Obtenir les parties de jeu
exports.getParties = async (req, res) => {
  try {
    const parties = await Jeu.find({
      $or: [
        { 'scores.utilisateur1.utilisateur': req.utilisateur.id },
        { 'scores.utilisateur2.utilisateur': req.utilisateur.id }
      ]
    })
    .populate('scores.utilisateur1.utilisateur', 'nom')
    .populate('scores.utilisateur2.utilisateur', 'nom')
    .sort({ dateCreation: -1 });

    res.status(200).json({
      success: true,
      count: parties.length,
      data: parties
    });

  } catch (error) {
    console.error('Erreur récupération parties:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des parties'
    });
  }
};