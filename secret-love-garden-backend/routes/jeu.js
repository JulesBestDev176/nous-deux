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

// @route   POST /api/jeu/partie/:partieId/corriger
// @desc    Corriger une réponse (pour jeux avec correction)
// @access  Privé
router.post('/partie/:partieId/corriger', protegerRoutes, jeuController.corrigerReponse);

// @route   PATCH /api/jeu/partie/:partieId/terminer
// @desc    Terminer une partie manuellement
// @access  Privé
router.patch('/partie/:partieId/terminer', protegerRoutes, jeuController.terminerPartie);

// @route   PATCH /api/jeu/partie/:partieId/abandonner
// @desc    Abandonner une partie
// @access  Privé
router.patch('/partie/:partieId/abandonner', protegerRoutes, jeuController.abandonnerPartie);

// @route   GET /api/jeu/defis
// @desc    Obtenir les défis disponibles pour le couple
// @access  Privé
router.get('/defis', protegerRoutes, jeuController.getDeffisCouple);

// @route   POST /api/jeu/defi/:defiId/completer
// @desc    Compléter un défi avec preuve
// @access  Privé
router.post('/defi/:defiId/completer', protegerRoutes, jeuController.completerDefi);

// @route   GET /api/jeu/questions/:typeJeu
// @desc    Obtenir les questions d'un type de jeu spécifique
// @access  Privé
router.get('/questions/:typeJeu', protegerRoutes, jeuController.getQuestionsJeu);

// @route   GET /api/jeu/statistiques
// @desc    Obtenir les statistiques globales des jeux
// @access  Privé
router.get('/statistiques', protegerRoutes, jeuController.getStatistiquesJeux);

module.exports = router;