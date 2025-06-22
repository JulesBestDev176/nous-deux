const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questions');
const { protegerRoutes } = require('../middlewares/auth');
const Utilisateur = require('../models/utilisateur');
const Reponse = require('../models/reponse');

// @route   GET /api/questions/du-jour
// @desc    Obtenir la question du jour
// @access  Privé
router.get('/du-jour', protegerRoutes, questionController.getQuestionDuJour);

// @route   POST /api/questions/repondre
// @desc    Soumettre une réponse
// @access  Privé
router.post(
  '/repondre',
  protegerRoutes,
  questionController.soumettreReponse
);

// @route   POST /api/questions/ajouter
// @desc    Ajouter une nouvelle question
// @access  Privé
router.post(
  '/ajouter',
  protegerRoutes,
  questionController.ajouterQuestion
);

// @route   GET /api/questions/utilisateur/:utilisateurId/reponses
// @desc    Récupérer toutes les réponses d'un utilisateur
// @access  Privé
router.get(
  '/utilisateur/:utilisateurId/reponses',
  protegerRoutes,
  questionController.getReponsesUtilisateur
);

// @route   GET /api/questions/:questionId/reponse
// @desc    Récupérer la réponse de l'utilisateur pour une question
// @access  Privé
router.get(
  '/:questionId/reponse',
  protegerRoutes,
  questionController.getReponseUtilisateur
);

// @route   GET /api/questions/personnalisees
// @desc    Récupérer les questions personnalisées de l'utilisateur
// @access  Privé
router.get(
  '/personnalisees',
  protegerRoutes,
  questionController.getQuestionsPersonnalisees
);

// @route   GET /api/questions/reponses-partenaire
// @desc    Récupérer les réponses du partenaire aux questions
// @access  Privé
router.get('/reponses-partenaire', protegerRoutes, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.user.id);
    if (!utilisateur || !utilisateur.partenaire) {
      return res.status(404).json({ success: false, message: 'Partenaire non trouvé' });
    }

    // 1. Trouver toutes les réponses du partenaire
    const reponsesPartenaire = await Reponse.find({ auteur: utilisateur.partenaire }).populate('question');

    if (!reponsesPartenaire || reponsesPartenaire.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 2. Formater les données pour le front
    const reponsesFormatees = reponsesPartenaire.map(reponse => {
      // S'assurer que la question est bien peuplée
      if (!reponse.question) return null;

      return {
        _id: reponse._id,
        texte: reponse.texte,
        dateReponse: reponse.dateReponse,
        lu: reponse.lu,
        question: {
          _id: reponse.question._id,
          texte: reponse.question.texte,
          type: reponse.question.type,
          categorie: reponse.question.categorie,
        },
        auteur: { // On peut inclure l'auteur si besoin, même si on sait que c'est le partenaire
          _id: utilisateur.partenaire,
        }
      };
    }).filter(Boolean); // Filtrer les réponses dont la question a été supprimée

    res.json({ success: true, data: reponsesFormatees });

  } catch (error) {
    console.error("Erreur - reponses-partenaire:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;