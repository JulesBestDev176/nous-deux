// routes/jeu.js
const express = require('express');
const router = express.Router();
const jeuController = require('../controllers/jeu');
const { protegerRoutes } = require('../middlewares/auth');

// @route   POST /api/jeu/partie
// @desc    Créer une nouvelle partie
// @access  Privé
router.post('/partie', protegerRoutes, jeuController.creerPartie);

// @route   GET /api/jeu/parties
// @desc    Obtenir les parties de jeu
// @access  Privé
router.get('/parties', protegerRoutes, jeuController.getParties);

// @route   PUT /api/jeu/partie/:partieId/repondre
// @desc    Répondre à une question
// @access  Privé
router.put('/partie/:partieId/repondre', protegerRoutes, jeuController.repondreQuestion);

module.exports = router;