// routes/objectif.js
const express = require('express');
const router = express.Router();
const objectifController = require('../controllers/objectif');
const { protegerRoutes } = require('../middlewares/auth');

// @route   POST /api/objectif/creer
// @desc    Créer un nouvel objectif
// @access  Privé
router.post('/creer', protegerRoutes, objectifController.creerObjectif);

// @route   GET /api/objectif
// @desc    Obtenir tous les objectifs
// @access  Privé
router.get('/', protegerRoutes, objectifController.getObjectifs);

// @route   PUT /api/objectif/:objectifId/progression
// @desc    Modifier la progression d'un objectif
// @access  Privé
router.put('/:objectifId/progression', protegerRoutes, objectifController.modifierProgression);

// @route   DELETE /api/objectif/:objectifId
// @desc    Supprimer un objectif
// @access  Privé
router.delete('/:objectifId', protegerRoutes, objectifController.supprimerObjectif);

module.exports = router;