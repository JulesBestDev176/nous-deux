const express = require('express');
const router = express.Router();
const histoireController = require('../controllers/histoire');
const { protegerRoutes } = require('../middlewares/auth');

// @route   GET /api/histoire/generer
// @desc    Générer une nouvelle entrée d'histoire
// @access  Privé
router.get('/generer', protegerRoutes, histoireController.genererHistoire);

// @route   GET /api/histoire
// @desc    Obtenir l'historique complet
// @access  Privé
router.get('/', protegerRoutes, histoireController.getHistorique);

module.exports = router;