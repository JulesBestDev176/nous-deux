// routes/voyage.js
const express = require('express');
const router = express.Router();
const voyageController = require('../controllers/voyage');
const { protegerRoutes } = require('../middlewares/auth');
const upload = require('../utils/upload');

// @route   POST /api/voyage/creer
// @desc    Créer un nouveau voyage
// @access  Privé
router.post(
  '/creer', 
  protegerRoutes, 
  upload.array('images', 5),
  voyageController.creerVoyage
);

// @route   GET /api/voyage
// @desc    Obtenir tous les voyages
// @access  Privé
router.get('/', protegerRoutes, voyageController.getVoyages);

// @route   POST /api/voyage/:voyageId/souvenir
// @desc    Ajouter un souvenir à un voyage
// @access  Privé
router.post(
  '/:voyageId/souvenir', 
  protegerRoutes, 
  upload.array('images', 3),
  voyageController.ajouterSouvenir
);

// @route   PUT /api/voyage/:voyageId
// @desc    Modifier un voyage
// @access  Privé
router.put('/:voyageId', protegerRoutes, voyageController.modifierVoyage);

// @route   PUT /api/voyage/:voyageId/statut
// @desc    Modifier le statut d'un voyage
// @access  Privé
router.put('/:voyageId/statut', protegerRoutes, voyageController.modifierStatutVoyage);

// @route   DELETE /api/voyage/:voyageId
// @desc    Supprimer un voyage
// @access  Privé
router.delete('/:voyageId', protegerRoutes, voyageController.supprimerVoyage);

module.exports = router;