const express = require('express');
const router = express.Router();
const rappelController = require('../controllers/rappel');
const { protegerRoutes } = require('../middlewares/auth');
const upload = require('../utils/upload');

// @route   POST /api/rappel/creer
// @desc    Créer un nouveau rappel
// @access  Privé
router.post(
  '/creer',
  protegerRoutes,
  upload.array('images', 5), // Maximum 5 images
  rappelController.creerRappel
);

// @route   GET /api/rappel
// @desc    Obtenir tous les rappels de l'utilisateur
// @access  Privé
router.get('/', protegerRoutes, rappelController.getRappels);

// @route   PUT /api/rappel/:rappelId/statut
// @desc    Modifier le statut d'un rappel
// @access  Privé
router.put(
  '/:rappelId/statut',
  protegerRoutes,
  rappelController.modifierStatutRappel
);

// @route   DELETE /api/rappel/:rappelId
// @desc    Supprimer un rappel
// @access  Privé
router.delete(
  '/:rappelId',
  protegerRoutes,
  rappelController.supprimerRappel
);

module.exports = router; 