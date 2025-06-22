// routes/message.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message');
const { protegerRoutes } = require('../middlewares/auth');
const upload = require('../utils/upload');

// @route   POST /api/message/envoyer
// @desc    Envoyer un message
// @access  Privé
router.post(
  '/envoyer', 
  protegerRoutes, 
  upload.array('images', 3),
  messageController.envoyerMessage
);

// @route   GET /api/message
// @desc    Obtenir les messages
// @access  Privé
router.get('/', protegerRoutes, messageController.getMessages);

// @route   PUT /api/message/:messageId/lu
// @desc    Marquer un message comme lu
// @access  Privé
router.put('/:messageId/lu', protegerRoutes, messageController.marquerCommeLu);

// @route   GET /api/message/citations
// @desc    Obtenir les citations
// @access  Privé
router.get('/citations', protegerRoutes, messageController.getCitations);

module.exports = router;