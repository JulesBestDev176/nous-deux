const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questions');
const { protegerRoutes } = require('../middlewares/auth');

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

module.exports = router;