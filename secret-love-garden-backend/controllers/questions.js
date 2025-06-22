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

    const question = await Question.create({
      texte,
      categorie: 'utilisateur',
      createur: req.utilisateur.id
    });

    res.status(201).json({
      success: true,
      data: {
        _id: question._id,
        texte: question.texte,
        categorie: question.categorie,
        createur: question.createur,
        dateCreation: question.dateCreation
      }
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
    console.log('🔍 Début getQuestionsAvecReponsesCouple pour utilisateur:', req.utilisateur.id);
    
    // 1. Récupérer l'utilisateur connecté avec son partenaire
    const utilisateurConnecte = await Utilisateur.findById(req.utilisateur.id).populate('partenaire');
    
    if (!utilisateurConnecte) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    console.log('👤 Utilisateur connecté:', {
      id: utilisateurConnecte._id,
      nom: utilisateurConnecte.nom,
      partenaireId: utilisateurConnecte.partenaire?._id,
      partenaireNom: utilisateurConnecte.partenaire?.nom
    });

    if (!utilisateurConnecte.partenaire) {
      return res.status(400).json({
        success: false,
        message: 'Aucun partenaire associé à ce compte'
      });
    }

    const partenaireId = utilisateurConnecte.partenaire._id;
    const utilisateurId = utilisateurConnecte._id;

    // 2. Récupérer toutes les questions qui ont au moins une réponse de l'un des deux partenaires
    const questionsAvecReponses = await Question.aggregate([
      {
        // Étape 1: Joindre les réponses
        $lookup: {
          from: 'reponses',
          localField: '_id',
          foreignField: 'question',
          as: 'toutesReponses'
        }
      },
      {
        // Étape 2: Filtrer les questions qui ont une réponse du couple
        $match: {
          'toutesReponses.utilisateur': { $in: [utilisateurId, partenaireId] }
        }
      },
      {
        // Étape 3: Créer un champ avec seulement les réponses du couple
        $addFields: {
          reponses: {
            $filter: {
              input: '$toutesReponses',
              as: 'reponse',
              cond: { $in: ['$$reponse.utilisateur', [utilisateurId, partenaireId]] }
            }
          }
        }
      },
      // === DEBUT DE LA NOUVELLE LOGIQUE DE POPULATION ===
      {
        // Étape 4: Déconstruire le tableau des réponses pour traiter chaque réponse
        $unwind: {
          path: '$reponses',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        // Étape 5: "Populer" l'utilisateur de chaque réponse
        $lookup: {
          from: 'utilisateurs',
          localField: 'reponses.utilisateur',
          foreignField: '_id',
          as: 'reponses.utilisateur'
        }
      },
      {
        // Étape 6: Remplacer le tableau utilisateur par le premier objet (et unique)
        $addFields: {
          'reponses.utilisateur': { $arrayElemAt: ['$reponses.utilisateur', 0] }
        }
      },
      {
        // Étape 7: Regrouper par question pour reformer les documents
        $group: {
          _id: '$_id',
          doc: { $first: '$$ROOT' },
          reponses: { $push: '$reponses' }
        }
      },
      {
        // Étape 8: Remodeler le document final
        $replaceRoot: {
          newRoot: {
            question: {
              _id: '$doc._id',
              texte: '$doc.texte',
              categorie: '$doc.categorie',
              dateCreation: '$doc.dateCreation'
            },
            reponses: '$reponses'
          }
        }
      },
       {
        // Étape 9: Retirer les champs sensibles de l'utilisateur
        $project: {
          'reponses.utilisateur.motDePasse': 0,
          'reponses.utilisateur.email': 0,
          'reponses.utilisateur.partenaire': 0,
          'reponses.utilisateur.dateCreation': 0,
          'reponses.utilisateur.__v': 0,
        }
      },
      {
        // Étape 10: Trier par date de création de la question
        $sort: { 'question.dateCreation': -1 }
      }
    ]);

    console.log(`📊 ${questionsAvecReponses.length} questions trouvées avec réponses du couple`);
    
    // Log détaillé pour debug
    questionsAvecReponses.forEach((item, index) => {
      console.log(`📝 Question ${index + 1}:`, {
        questionId: item.question._id,
        texte: item.question.texte.substring(0, 50) + '...',
        nombreReponses: item.reponses.length,
        auteurs: item.reponses.map(r => r.utilisateur.nom)
      });
    });

    res.status(200).json({
      success: true,
      count: questionsAvecReponses.length,
      data: questionsAvecReponses
    });

  } catch (error) {
    console.error('❌ Erreur dans getQuestionsAvecReponsesCouple:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réponses du couple',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};