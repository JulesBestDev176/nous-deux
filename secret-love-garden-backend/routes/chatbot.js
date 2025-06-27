const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');
const { protegerRoutes } = require('../middlewares/auth');

// Route principale du chatbot
router.post('/chat', protegerRoutes, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.utilisateur.id || req.utilisateur._id;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Le message ne peut pas être vide' });
    }
    const result = await chatbotService.chat(userId, message);
    res.json(result);
  } catch (error) {
    console.error('Erreur route chatbot:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur', error: error.message });
  }
});

// Route pour obtenir l'analyse du couple sans chat
router.get('/analysis', protegerRoutes, async (req, res) => {
  try {
    const userId = req.utilisateur.id || req.utilisateur._id;
    const context = await chatbotService.getUserContext(userId);
    const analysis = chatbotService.analyzeCoupleHealth(context);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Erreur route analysis:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'analyse', error: error.message });
  }
});

// Route pour obtenir des suggestions d'activités
router.get('/suggestions', protegerRoutes, async (req, res) => {
  try {
    const userId = req.utilisateur.id || req.utilisateur._id;
    const context = await chatbotService.getUserContext(userId);
    const suggestions = chatbotService.suggestActivities(context);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Erreur route suggestions:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération des suggestions', error: error.message });
  }
});

module.exports = router; 