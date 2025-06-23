const express = require('express');
const router = express.Router();
const histoireController = require('../controllers/histoire');
const { protegerRoutes } = require('../middlewares/auth');

// @route   GET /api/histoire
// @desc    Obtenir l'historique de l'histoire
// @access  Privé
router.get('/', protegerRoutes, histoireController.getHistorique);

module.exports = router;