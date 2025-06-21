const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authentification');
const { protegerRoutes } = require('../middlewares/auth');

// @route   POST /api/auth/init
// @desc    Initialiser les comptes
// @access  Public
router.post('/init', authController.initialisation);

// @route   POST /api/auth/connexion
// @desc    Connexion avec code
// @access  Public
router.post(
  '/connexion',
  [
    check('code', 'Le code est requis').not().isEmpty()
  ],
  authController.connexion
);

// @route   POST /api/auth/deconnexion
// @desc    Déconnexion
// @access  Privé
router.post('/deconnexion', protegerRoutes, authController.deconnexion);

router.get('/verifier-session', protegerRoutes, authController.verifierSession);

module.exports = router;