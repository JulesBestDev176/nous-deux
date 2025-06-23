const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questions');
const { protegerRoutes } = require('../middlewares/auth');
const Utilisateur = require('../models/Utilisateur');
const Reponse = require('../models/Reponse');

// @route   GET /api/questions/du-jour
// @desc    Obtenir la question du jour
// @access  Privé
router.get('/du-jour', protegerRoutes, questionController.getQuestionDuJour);

// @route   POST /api/questions/repondre
// @desc    Soumettre une réponse
// @access  Privé
router.post(
  '/repondre',
  protegerRoutes,
  questionController.soumettreReponse
);

// @route   POST /api/questions/ajouter
// @desc    Ajouter une nouvelle question
// @access  Privé
router.post(
  '/ajouter',
  protegerRoutes,
  questionController.ajouterQuestion
);

// @route   GET /api/questions/utilisateur/:utilisateurId/reponses
// @desc    Récupérer toutes les réponses d'un utilisateur
// @access  Privé
router.get(
  '/utilisateur/:utilisateurId/reponses',
  protegerRoutes,
  questionController.getReponsesUtilisateur
);

// @route   GET /api/questions/:questionId/reponse
// @desc    Récupérer la réponse de l'utilisateur pour une question
// @access  Privé
router.get(
  '/:questionId/reponse',
  protegerRoutes,
  questionController.getReponseUtilisateur
);

// @route   GET /api/questions/personnalisees
// @desc    Récupérer les questions personnalisées de l'utilisateur
// @access  Privé
router.get(
  '/personnalisees',
  protegerRoutes,
  questionController.getQuestionsPersonnalisees
);

// 🆕 @route   GET /api/questions/couple-responses
// @desc    Récupérer toutes les questions avec les réponses du couple
// @access  Privé
router.get(
  '/couple-responses',
  protegerRoutes,
  questionController.getQuestionsAvecReponsesCouple
);

// @route   GET /api/questions/reponses-partenaire
// @desc    Récupérer les réponses du partenaire aux questions (ancienne version - conservée pour compatibilité)
// @access  Privé
router.get('/reponses-partenaire', protegerRoutes, async (req, res) => {
  try {
    console.log('🔍 Route reponses-partenaire appelée pour utilisateur:', req.utilisateur.id);
    
    const utilisateur = await Utilisateur.findById(req.utilisateur.id).populate('partenaire');
    
    if (!utilisateur || !utilisateur.partenaire) {
      return res.status(404).json({ 
        success: false, 
        message: 'Partenaire non trouvé' 
      });
    }

    console.log('👥 Partenaire trouvé:', {
      id: utilisateur.partenaire._id,
      nom: utilisateur.partenaire.nom
    });

    // Trouver toutes les réponses du partenaire
    const reponsesPartenaire = await Reponse.find({ 
      utilisateur: utilisateur.partenaire._id 
    })
    .populate('question')
    .populate('utilisateur', 'nom')
    .sort({ dateReponse: -1 });

    console.log(`📊 ${reponsesPartenaire.length} réponses trouvées pour le partenaire`);

    if (!reponsesPartenaire || reponsesPartenaire.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Formater les données pour le front
    const reponsesFormatees = reponsesPartenaire.map(reponse => {
      // S'assurer que la question est bien peuplée
      if (!reponse.question) {
        console.warn('⚠️ Question manquante pour la réponse:', reponse._id);
        return null;
      }

      return {
        _id: reponse._id,
        texte: reponse.texte,
        dateReponse: reponse.dateReponse,
        question: {
          _id: reponse.question._id,
          texte: reponse.question.texte,
          categorie: reponse.question.categorie,
          dateCreation: reponse.question.dateCreation
        },
        utilisateur: {
          _id: reponse.utilisateur._id,
          nom: reponse.utilisateur.nom
        }
      };
    }).filter(Boolean); // Filtrer les réponses dont la question a été supprimée

    console.log(`✅ ${reponsesFormatees.length} réponses formatées envoyées`);

    res.json({ 
      success: true, 
      count: reponsesFormatees.length,
      data: reponsesFormatees 
    });

  } catch (error) {
    console.error("❌ Erreur - reponses-partenaire:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/questions/:questionId
// @desc    Supprimer une question personnalisée
// @access  Privé
router.delete(
  '/:questionId',
  protegerRoutes,
  questionController.supprimerQuestion
);

module.exports = router;