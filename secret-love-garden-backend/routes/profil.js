// routes/profil.js
const express = require('express');
const router = express.Router();
const profilController = require('../controllers/profil');
const { protegerRoutes } = require('../middlewares/auth');

// @route   GET /api/profil/couple
// @desc    Obtenir le profil couple
// @access  Privé
router.get('/couple', protegerRoutes, profilController.getProfilCouple);

// @route   POST /api/profil/test/love-languages
// @desc    Faire le test des langages d'amour
// @access  Privé
router.post('/test/love-languages', protegerRoutes, profilController.faireLoveLanguagesTest);

// @route   GET /api/profil/test/:typeTest/questions
// @desc    Obtenir les questions d'un test
// @access  Privé
router.get('/test/:typeTest/questions', protegerRoutes, profilController.getTestQuestions);

module.exports = router;