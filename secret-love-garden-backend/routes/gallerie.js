const express = require('express');
const router = express.Router();
const gallerieController = require('../controllers/gallerie');
const upload = require('../utils/upload');
const { protegerRoutes } = require('../middlewares/auth');

// @route   POST /api/gallerie
// @desc    Uploader une image
// @access  Privé
router.post(
  '/',
  protegerRoutes,
  upload.single('image'),
  gallerieController.uploadImage
);

// @route   GET /api/gallerie
// @desc    Obtenir toutes les images
// @access  Privé
router.get('/', protegerRoutes, gallerieController.getImages);

module.exports = router;