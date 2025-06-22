// routes/calendrier.js
const express = require('express');
const router = express.Router();
const calendrierController = require('../controllers/calendrier');
const { protegerRoutes } = require('../middlewares/auth');

// @route   POST /api/calendrier/evenement
// @desc    Créer un nouvel événement
// @access  Privé
router.post('/evenement', protegerRoutes, calendrierController.creerEvenement);

// @route   GET /api/calendrier/evenements
// @desc    Obtenir tous les événements
// @access  Privé
router.get('/evenements', protegerRoutes, calendrierController.getEvenements);

// @route   PUT /api/calendrier/evenement/:evenementId
// @desc    Modifier un événement
// @access  Privé
router.put('/evenement/:evenementId', protegerRoutes, calendrierController.modifierEvenement);

// @route   DELETE /api/calendrier/evenement/:evenementId
// @desc    Supprimer un événement
// @access  Privé
router.delete('/evenement/:evenementId', protegerRoutes, calendrierController.supprimerEvenement);

module.exports = router;