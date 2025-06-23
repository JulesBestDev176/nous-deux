const Question = require('../models/Question');
const Reponse = require('../models/Reponse');
const Histoire = require('../models/Histoire');
const Utilisateur = require('../models/Utilisateur');
const mongoose = require('mongoose');

exports.getQuestionDuJour = async (req, res) => {
  try {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    let question = await Question.findOne({
      dateProgrammation: {
        $gte: aujourdHui,
        $lt: new Date(aujourdHui.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!question) {
      const questionsRepondues = await Reponse.find({ 
        utilisateur: req.utilisateur.id 
      }).distinct('question');

      const questionsDisponibles = await Question.aggregate([
        { $match: { 
          _id: { $nin: questionsRepondues },
          categorie: 'systeme' 
        }},
        { $sample: { size: 1 } }
      ]);

      if (questionsDisponibles.length > 0) {
        question = questionsDisponibles[0];
        await Question.findByIdAndUpdate(question._id, { 
          dateProgrammation: aujourdHui 
        });
      } else {
        return res.status(404).json({ 
          success: false,
          message: 'Toutes les questions ont été répondues' 
        });
      }
    }

    res.status(200).json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error('Erreur finale dans getQuestionDuJour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la question'
    });
  }
};

exports.soumettreReponse = async (req, res) => {
  try {
    const { questionId, texte } = req.body;

    // Valider l'ID de la question
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: 'ID de question invalide' });
    }

    // Vérifier que la question existe
    const questionExist = await Question.exists({ _id: questionId });
    if (!questionExist) {
      return res.status(404).json({
        success: false,
        message: 'Question non trouvée'
      });
    }

    const reponse = await Reponse.create({
      question: questionId,
      utilisateur: req.utilisateur.id,
      texte
    });

    // Trouver le partenaire
    const partenaire = await Utilisateur.findOne({ 
      _id: { $ne: req.utilisateur.id } 
    });

    await Histoire.create({
      type: 'question',
      question: questionId,
      reponse: reponse._id,
      partenaire: partenaire._id,
      message: 'Nouvelle réponse enregistrée',
      createur: req.utilisateur.id
    });

    res.status(201).json({
      success: true,
      data: {
        _id: reponse._id,
        question: reponse.question,
        texte: reponse.texte,
        dateReponse: reponse.dateReponse
      }
    });

  } catch (error) {
    console.error('Erreur soumission réponse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la réponse'
    });
  }
};

exports.ajouterQuestion = async (req, res) => {
  try {
    const { texte } = req.body;

    if (!texte || texte.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'La question doit contenir au moins 5 caractères'
      });
    }

    let question = await Question.create({
      texte,
      categorie: 'utilisateur',
      createur: req.utilisateur.id
    });

    // On peuple le créateur pour renvoyer l'objet complet au frontend
    question = await question.populate('createur', 'nom');

    res.status(201).json({
      success: true,
      data: question
    });

  } catch (error) {
    console.error('Erreur ajout question:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la question'
    });
  }
};

exports.getReponseUtilisateur = async (req, res) => {
  try {
    const { questionId } = req.params;

    // Valider l'ID de la question
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ success: false, message: 'ID de question invalide' });
    }

    // Vérifier que la question existe
    const questionExist = await Question.exists({ _id: questionId });
    if (!questionExist) {
      return res.status(404).json({
        success: false,
        message: 'Question non trouvée'
      });
    }

    // Récupérer la réponse de l'utilisateur pour cette question
    const reponse = await Reponse.findOne({
      question: questionId,
      utilisateur: req.utilisateur.id
    });

    if (!reponse) {
      return res.status(404).json({
        success: false,
        message: 'Aucune réponse trouvée pour cette question'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: reponse._id,
        question: reponse.question,
        texte: reponse.texte,
        dateReponse: reponse.dateReponse
      }
    });

  } catch (error) {
    console.error('Erreur récupération réponse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la réponse'
    });
  }
};

exports.getReponsesUtilisateur = async (req, res) => {
  try {
    const { utilisateurId } = req.params;

    // Valider l'ID de l'utilisateur
    if (!mongoose.Types.ObjectId.isValid(utilisateurId)) {
      return res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
    }

    // Vérifier que l'utilisateur existe
    const utilisateurExist = await Utilisateur.exists({ _id: utilisateurId });
    if (!utilisateurExist) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer toutes les réponses de l'utilisateur avec les questions
    const reponses = await Reponse.find({ utilisateur: utilisateurId })
      .populate('question', 'texte')
      .sort({ dateReponse: -1 });

    res.status(200).json({
      success: true,
      count: reponses.length,
      data: reponses.map(reponse => ({
        _id: reponse._id,
        question: reponse.question,
        texte: reponse.texte,
        dateReponse: reponse.dateReponse
      }))
    });

  } catch (error) {
    console.error('Erreur récupération réponses utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réponses'
    });
  }
};

exports.getQuestionsPersonnalisees = async (req, res) => {
  try {
    const questions = await Question.find({
      categorie: 'utilisateur'
    }).populate('createur', 'nom').sort({ dateCreation: -1 });

    // Debug: afficher la structure des données
    console.log('Questions personnalisées récupérées:', questions.map(q => ({
      id: q._id,
      texte: q.texte,
      createur: q.createur,
      createurNom: q.createur?.nom
    })));

    res.status(200).json({
      success: true,
      data: questions
    });

  } catch (error) {
    console.error('Erreur récupération questions personnalisées:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des questions personnalisées'
    });
  }
};

// 🆕 NOUVELLE FONCTION: Récupérer les questions avec les réponses du couple
exports.getQuestionsAvecReponsesCouple = async (req, res) => {
  try {
    const utilisateurConnecte = await Utilisateur.findById(req.utilisateur.id);
    if (!utilisateurConnecte || !utilisateurConnecte.partenaire) {
      return res.status(404).json({ success: false, message: 'Utilisateur ou partenaire non trouvé' });
    }
    const partenaireId = utilisateurConnecte.partenaire;

    // 1. Récupérer toutes les questions personnalisées ET système, avec leur créateur
    const questions = await Question.find({ categorie: { $in: ['utilisateur', 'systeme'] } })
      .populate('createur', 'nom')
      .sort({ dateCreation: -1 })
      .lean();

    // 2. Pour chaque question, trouver les réponses du couple
    const questionsAvecReponses = await Promise.all(
      questions.map(async (question) => {
        const reponses = await Reponse.find({
          question: question._id,
          utilisateur: { $in: [utilisateurConnecte._id, partenaireId] }
        })
        .populate('utilisateur', 'nom')
        .sort({ dateReponse: 'asc' })
        .lean();
        
        return { ...question, reponses };
      })
    );
    
    res.status(200).json({
      success: true,
      data: questionsAvecReponses
    });

  } catch (error) {
    console.error('Erreur getQuestionsAvecReponsesCouple:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// �� NOUVELLE FONCTION: Supprimer une question
exports.supprimerQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    // Correction : s'assurer que l'ID utilisateur est un ObjectId pour la comparaison
    const userId = new mongoose.Types.ObjectId(req.utilisateur.id);

    console.log(`Tentative de suppression de la question ${questionId} par l'utilisateur ${userId}`);

    const question = await Question.findOne({
      _id: questionId,
      createur: userId
    });

    if (!question) {
      const questionTrouvee = await Question.findById(questionId);
      console.log(`ÉCHEC: La vérification du créateur a échoué.`);
      console.log(`   - ID utilisateur demandeur: ${req.utilisateur.id}`);
      console.log(`   - ID créateur dans la DB:   ${questionTrouvee?.createur}`);
      return res.status(404).json({
        success: false,
        message: 'Question non trouvée ou vous n\'êtes pas autorisé à la supprimer'
      });
    }

    // On supprime aussi les réponses associées
    await Reponse.deleteMany({ question: questionId });
    await question.deleteOne();

    console.log(`SUCCÈS: Question ${questionId} supprimée.`);
    res.status(200).json({
      success: true,
      message: 'Question et réponses associées supprimées'
    });

  } catch (error) {
    console.error('Erreur suppression question:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la question'
    });
  }
};