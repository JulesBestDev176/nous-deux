// routes/statistique.js
const express = require('express');
const router = express.Router();
const statistiqueController = require('../controllers/statistique');
const { protegerRoutes } = require('../middlewares/auth');

// @route   POST /api/statistique/enregistrer
// @desc    Enregistrer une statistique
// @access  Privé
router.post('/enregistrer', protegerRoutes, statistiqueController.enregistrerStatistique);

// @route   GET /api/statistique
// @desc    Obtenir les statistiques
// @access  Privé
router.get('/', protegerRoutes, statistiqueController.getStatistiques);

// @route   GET /api/statistique/resume
// @desc    Obtenir un résumé des statistiques
// @access  Privé
router.get('/resume', protegerRoutes, statistiqueController.getResumeStatistiques);

// @route   GET /api/statistique/tendances
// @desc    Obtenir les tendances hebdomadaires
// @access  Privé
router.get('/tendances', protegerRoutes, statistiqueController.getTendancesHebdomadaires);

// Nouvelles routes pour correspondre au frontend
router.get('/generales', protegerRoutes, statistiqueController.getStatistiquesGenerales);
router.get('/messages', protegerRoutes, statistiqueController.getStatistiquesMessages);
router.get('/activites', protegerRoutes, statistiqueController.getStatistiquesActivites);
router.get('/humeur', protegerRoutes, statistiqueController.getStatistiquesHumeur);
router.post('/humeur', protegerRoutes, statistiqueController.ajouterHumeur);
router.get('/temps-ensemble', protegerRoutes, statistiqueController.getTempsEnsemble);

module.exports = router;