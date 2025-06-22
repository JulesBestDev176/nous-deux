const express = require('express');
const router = express.Router();
const jeuController = require('../controllers/jeu');
const { protegerRoutes } = require('../middlewares/auth');

// @route   GET /api/jeu/disponibles
// @desc    Obtenir les jeux disponibles
// @access  Privé
router.get('/disponibles', protegerRoutes, jeuController.getJeuxDisponibles);

// @route   GET /api/jeu/historique
// @desc    Obtenir l'historique des parties
// @access  Privé
router.get('/historique', protegerRoutes, jeuController.getHistorique);

// @route   POST /api/jeu/demarrer
// @desc    Démarrer une nouvelle partie
// @access  Privé
router.post('/demarrer', protegerRoutes, jeuController.demarrerPartie);

// @route   GET /api/jeu/partie/:partieId
// @desc    Obtenir l'état d'une partie en cours
// @access  Privé
router.get('/partie/:partieId', protegerRoutes, jeuController.getPartie);

// @route   POST /api/jeu/partie/:partieId/reponse
// @desc    Soumettre une réponse pour une partie
// @access  Privé
router.post('/partie/:partieId/reponse', protegerRoutes, jeuController.soumettreReponse);

// @route   GET /api/jeu/quiz-relation
// @desc    Obtenir les questions du quiz de relation
// @access  Privé
router.get('/quiz-relation', protegerRoutes, jeuController.getQuizRelation);

// @route   GET /api/jeu/defis
// @desc    Obtenir les défis disponibles pour le couple
// @access  Privé
router.get('/defis', protegerRoutes, jeuController.getDeffisCouple);

// @route   POST /api/jeu/defi/:defiId/completer
// @desc    Compléter un défi avec preuve
// @access  Privé
router.post('/defi/:defiId/completer', protegerRoutes, jeuController.completerDefi);

// @route   GET /api/jeu/questions-preferences
// @desc    Obtenir les questions de préférences
// @access  Privé
router.get('/questions-preferences', protegerRoutes, jeuController.getQuestionsPreferences);

module.exports = router;