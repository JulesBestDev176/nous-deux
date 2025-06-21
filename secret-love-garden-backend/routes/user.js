const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur');
const { protegerRoutes } = require('../middlewares/auth');
const { check } = require('express-validator');

// @route   PUT /api/user/code
// @desc    Modifier le code utilisateur
// @access  Privé
router.put('/code', [
  protegerRoutes,
  check('ancienCode', 'Ancien code requis').not().isEmpty(),
  check('nouveauCode', 'Nouveau code requis').not().isEmpty()
], utilisateurController.modifierCode);

// @route   GET /api/user/profil
// @desc    Obtenir le profil utilisateur
// @access  Privé
router.get('/profil', protegerRoutes, utilisateurController.getProfil);

// @route   GET /api/user/partenaire
// @desc    Obtenir les informations du partenaire
// @access  Privé
router.get('/partenaire', protegerRoutes, utilisateurController.getPartenaire);

module.exports = router;