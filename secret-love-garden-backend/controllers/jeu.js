const Jeu = require('../models/Jeu');
const JeuType = require('../models/JeuType');
const QuestionJeu = require('../models/QuestionJeu');
const Defi = require('../models/Defi');
const Utilisateur = require('../models/Utilisateur');
const mongoose = require('mongoose');

// Mélange un tableau
function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Obtenir les jeux disponibles depuis la base de données
exports.getJeuxDisponibles = async (req, res) => {
  try {
    const jeux = await JeuType.find({ actif: true }).sort({ nom: 1 });
    res.status(200).json({ success: true, data: jeux });
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir l'historique des parties terminées
exports.getHistorique = async (req, res) => {
  try {
    const parties = await Jeu.find({
      $or: [
        { 'scores.utilisateur1.utilisateur': req.utilisateur.id },
        { 'scores.utilisateur2.utilisateur': req.utilisateur.id }
      ],
      statut: { $in: ['termine', 'abandonne'] }
    })
    .populate('scores.utilisateur1.utilisateur', 'nom')
    .populate('scores.utilisateur2.utilisateur', 'nom')
    .sort({ dateFin: -1 });

    res.status(200).json({ success: true, data: parties });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Générer les questions pour un jeu
async function genererQuestions(typeJeu, utilisateur1Id, utilisateur2Id) {
  try {
    // Récupérer les questions depuis la base de données
    const questions = await QuestionJeu.find({ 
      typeJeu, 
      actif: true 
    });

    if (!questions || questions.length === 0) {
      throw new Error(`Aucune question trouvée pour le jeu ${typeJeu}`);
    }

    // Récupérer la configuration du jeu
    let jeuConfig;
    if (typeJeu.startsWith('quiz-')) {
      const quizCoupleConfig = await JeuType.findOne({ id: 'quiz-couple' });
      if (quizCoupleConfig?.subQuizzes) {
        jeuConfig = quizCoupleConfig.subQuizzes.find(sq => sq.id === typeJeu);
      }
    } else {
      jeuConfig = await JeuType.findOne({ id: typeJeu });
    }

    if (!jeuConfig) {
      throw new Error(`Configuration de jeu introuvable pour ${typeJeu}`);
    }

    const nombreQuestions = Math.min(
      jeuConfig.maxQuestions || 6, 
      questions.length
    );

    const questionsSelectionnees = shuffle(questions).slice(0, nombreQuestions);

    if (jeuConfig.needsCorrection || typeJeu.startsWith('quiz-')) {
      // Pour les quiz couple: chaque question a 2 instances (une par direction)
      const questionsGenerees = [];
      
      questionsSelectionnees.forEach((question) => {
        // Instance 1 : utilisateur1 sujet, utilisateur2 devineur
        questionsGenerees.push({
          questionText: question.questionText,
          sujet: utilisateur1Id,
          devineur: utilisateur2Id,
          points: question.points || 10,
          reponseSujet: '',
          reponseDevineur: '',
          reponduParSujet: false,
          reponduParDevineur: false,
          estCorrect: null,
          corrigePar: null
        });
        // Instance 2 : utilisateur2 sujet, utilisateur1 devineur
        questionsGenerees.push({
          questionText: question.questionText,
          sujet: utilisateur2Id,
          devineur: utilisateur1Id,
          points: question.points || 10,
          reponseSujet: '',
          reponseDevineur: '',
          reponduParSujet: false,
          reponduParDevineur: false,
          estCorrect: null,
          corrigePar: null
        });
      });
      
      return questionsGenerees;
    } else {
      // Questions simples
      if (typeJeu === 'tu-preferes') {
        return questionsSelectionnees.map(question => ({
          questionText: question.questionText,
          optionA: question.optionA,
          optionB: question.optionB,
          points: question.points || 5,
          reponseUtilisateur1: '',
          reponseUtilisateur2: '',
          reponduParUtilisateur1: false,
          reponduParUtilisateur2: false
        }));
      }
      
      return questionsSelectionnees.map(question => ({
        questionText: question.questionText,
        points: question.points || 5,
        reponseUtilisateur1: '',
        reponseUtilisateur2: '',
        reponduParUtilisateur1: false,
        reponduParUtilisateur2: false
      }));
    }
  } catch (error) {
    console.error('Erreur lors de la génération des questions:', error);
    throw error;
  }
}

// Démarrer une nouvelle partie
exports.demarrerPartie = async (req, res) => {
  try {
    const { typeJeu } = req.body;
    const createurId = new mongoose.Types.ObjectId(req.utilisateur.id);

    // Vérifier que le type de jeu existe (jeu principal ou sous-quiz)
    let jeuConfig;
    let typeJeuPrincipal = typeJeu;
    
    if (typeJeu.startsWith('quiz-')) {
      // C'est un sous-quiz de couple
      const quizCoupleConfig = await JeuType.findOne({ id: 'quiz-couple' });
      if (quizCoupleConfig?.subQuizzes) {
        jeuConfig = quizCoupleConfig.subQuizzes.find(sq => sq.id === typeJeu);
        typeJeuPrincipal = 'quiz-couple'; // Pour la base de données
      }
    } else {
      jeuConfig = await JeuType.findOne({ id: typeJeu, actif: true });
    }
    
    if (!jeuConfig) {
      return res.status(400).json({ success: false, message: 'Type de jeu invalide.' });
    }

    const utilisateur = await Utilisateur.findById(createurId);
    if (!utilisateur || !utilisateur.partenaire) {
      return res.status(400).json({ success: false, message: 'Partenaire non trouvé.' });
    }
    const partenaireId = utilisateur.partenaire;

    // Vérifier si une partie de ce type est déjà en cours
    const partieEnCours = await Jeu.findOne({
        type: typeJeuPrincipal,
        statut: 'en_cours',
        $or: [
            { 'scores.utilisateur1.utilisateur': createurId },
            { 'scores.utilisateur2.utilisateur': createurId }
        ]
    });

    if (partieEnCours) {
        return res.status(200).json({ 
          success: true, 
          data: partieEnCours, 
          message: 'Une partie est déjà en cours.' 
        });
    }
    
    // Générer les questions (utiliser l'ID du sous-quiz si applicable)
    const questionsGenerees = await genererQuestions(typeJeu, createurId, partenaireId);
    
    const nouvellePartie = new Jeu({
      type: typeJeuPrincipal, // Stockage du type principal en DB
      createur: createurId,
      nombreQuestions: questionsGenerees.length,
      scores: {
        utilisateur1: { utilisateur: createurId, score: 0 },
        utilisateur2: { utilisateur: partenaireId, score: 0 }
      },
      tourActuel: createurId,
      // Stocker l'ID du sous-quiz pour référence
      ...(typeJeu.startsWith('quiz-') && { subQuizId: typeJeu })
    });

    // Ajouter les questions selon le type
    if (jeuConfig.needsCorrection || typeJeu.startsWith('quiz-')) {
      nouvellePartie.questions = shuffle(questionsGenerees);
    } else {
      nouvellePartie.questionsSimples = shuffle(questionsGenerees);
    }

    await nouvellePartie.save();

    // Populer les utilisateurs avant de renvoyer
    const partiePopulee = await Jeu.findById(nouvellePartie._id)
      .populate('scores.utilisateur1.utilisateur', 'nom')
      .populate('scores.utilisateur2.utilisateur', 'nom');

    res.status(201).json({ success: true, data: partiePopulee });
  } catch (error) {
    console.error('Erreur lors de la création de la partie:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la partie.' });
  }
};

// Soumettre une réponse
exports.soumettreReponse = async (req, res) => {
    try {
        const { partieId } = req.params;
        const { indexQuestion, reponse } = req.body;
        const userId = new mongoose.Types.ObjectId(req.utilisateur.id);

        const partie = await Jeu.findById(partieId);
        if (!partie) {
          return res.status(404).json({ success: false, message: 'Partie non trouvée.' });
        }
        if (partie.statut !== 'en_cours') {
          return res.status(400).json({ success: false, message: 'Cette partie n\'est plus active.' });
        }

        // Déterminer si c'est un jeu avec correction
        const jeuConfig = await JeuType.findOne({ id: partie.type });
        const estJeuAvecCorrection = jeuConfig?.needsCorrection || partie.type === 'quiz-couple';
        
        if (estJeuAvecCorrection) {
          // Logique pour jeux avec correction
          const question = partie.questions[indexQuestion];
          if (!question) {
            return res.status(404).json({ success: false, message: 'Question non trouvée.' });
          }

          const estSujet = question.sujet.equals(userId);
          const estDevineur = question.devineur.equals(userId);

          if (estSujet) {
              if (question.reponduParSujet) {
                return res.status(400).json({ success: false, message: 'Vous avez déjà donné la réponse.' });
              }
              question.reponseSujet = reponse;
              question.reponduParSujet = true;
          } else if (estDevineur) {
              if (question.reponduParDevineur) {
                return res.status(400).json({ success: false, message: 'Vous avez déjà tenté de deviner.' });
              }
              question.reponseDevineur = reponse;
              question.reponduParDevineur = true;
          } else {
              return res.status(403).json({ success: false, message: 'Vous ne faites pas partie de ce jeu.' });
          }
        } else {
          // Logique pour jeux simples
          const question = partie.questionsSimples[indexQuestion];
          if (!question) {
            return res.status(404).json({ success: false, message: 'Question non trouvée.' });
          }

          const estUtilisateur1 = partie.scores.utilisateur1.utilisateur.equals(userId);
          
          if (estUtilisateur1) {
            if (question.reponduParUtilisateur1) {
              return res.status(400).json({ success: false, message: 'Vous avez déjà répondu.' });
            }
            question.reponseUtilisateur1 = reponse;
            question.reponduParUtilisateur1 = true;
          } else {
            if (question.reponduParUtilisateur2) {
              return res.status(400).json({ success: false, message: 'Vous avez déjà répondu.' });
            }
            question.reponseUtilisateur2 = reponse;
            question.reponduParUtilisateur2 = true;
          }

          // Attribution automatique des points pour les jeux simples
          if (question.reponduParUtilisateur1 && question.reponduParUtilisateur2) {
            // Points partagés pour avoir participé
            partie.scores.utilisateur1.score += question.points || 5;
            partie.scores.utilisateur2.score += question.points || 5;
          }
        }
        
        // Mise à jour du tour
        partie.tourActuel = partie.tourActuel.equals(partie.scores.utilisateur1.utilisateur) ?
            partie.scores.utilisateur2.utilisateur :
            partie.scores.utilisateur1.utilisateur;

        await partie.save();
        
        const partiePopulee = await Jeu.findById(partie._id)
            .populate('scores.utilisateur1.utilisateur', 'nom')
            .populate('scores.utilisateur2.utilisateur', 'nom');
            
        res.status(200).json({ success: true, data: partiePopulee });

    } catch (error) {
        console.error("Erreur soumission réponse:", error);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
};

// Corriger une réponse (uniquement pour les jeux avec correction)
exports.corrigerReponse = async (req, res) => {
  try {
    const { partieId } = req.params;
    const { indexQuestion, estCorrect } = req.body;
    const userId = new mongoose.Types.ObjectId(req.utilisateur.id);

    const partie = await Jeu.findById(partieId);
    if (!partie) {
      return res.status(404).json({ success: false, message: 'Partie non trouvée.' });
    }

    const question = partie.questions[indexQuestion];
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question non trouvée.' });
    }

    // Vérifier que c'est bien le sujet qui corrige
    if (!question.sujet.equals(userId)) {
      return res.status(403).json({ success: false, message: 'Seul le sujet peut corriger cette réponse.' });
    }

    // Vérifier que la question est prête à être corrigée
    if (!question.reponduParSujet || !question.reponduParDevineur) {
      return res.status(400).json({ success: false, message: 'Question incomplète, correction impossible.' });
    }

    // Vérifier que la question n'a pas déjà été corrigée
    if (question.corrigePar) {
      return res.status(400).json({ success: false, message: 'Cette question a déjà été corrigée.' });
    }

    // Appliquer la correction
    question.estCorrect = estCorrect;
    question.corrigePar = userId;
    question.dateCorrection = new Date();

    // Attribution des points si correct
    if (estCorrect) {
      const devineurScore = question.devineur.equals(partie.scores.utilisateur1.utilisateur) ? 
        'utilisateur1' : 'utilisateur2';
      partie.scores[devineurScore].score += question.points || 10;
    }

    await partie.save();

    const partiePopulee = await Jeu.findById(partie._id)
      .populate('scores.utilisateur1.utilisateur', 'nom')
      .populate('scores.utilisateur2.utilisateur', 'nom');

    res.status(200).json({ success: true, data: partiePopulee });

  } catch (error) {
    console.error("Erreur correction réponse:", error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// Obtenir une partie par son ID
exports.getPartie = async (req, res) => {
    try {
        const partie = await Jeu.findById(req.params.partieId)
            .populate('scores.utilisateur1.utilisateur', 'nom')
            .populate('scores.utilisateur2.utilisateur', 'nom');

        if (!partie) {
            return res.status(404).json({ success: false, message: 'Partie non trouvée' });
        }
        
        res.status(200).json({ success: true, data: partie });
    } catch (error) {
        console.error('Erreur lors de la récupération de la partie:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Terminer une partie manuellement
exports.terminerPartie = async (req, res) => {
  try {
    const { partieId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.utilisateur.id);

    const partie = await Jeu.findById(partieId);
    if (!partie) {
      return res.status(404).json({ success: false, message: 'Partie non trouvée' });
    }

    // Vérifier que l'utilisateur fait partie de cette partie
    const estParticipant = partie.scores.utilisateur1.utilisateur.equals(userId) || 
                          partie.scores.utilisateur2.utilisateur.equals(userId);
    
    if (!estParticipant) {
      return res.status(403).json({ success: false, message: 'Vous ne faites pas partie de cette partie' });
    }

    partie.statut = 'termine';
    partie.dateFin = new Date();
    
    await partie.save();

    const partiePopulee = await Jeu.findById(partie._id)
      .populate('scores.utilisateur1.utilisateur', 'nom')
      .populate('scores.utilisateur2.utilisateur', 'nom');

    res.status(200).json({ success: true, data: partiePopulee });

  } catch (error) {
    console.error('Erreur lors de la finalisation de la partie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Abandonner une partie
exports.abandonnerPartie = async (req, res) => {
  try {
    const { partieId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.utilisateur.id);

    const partie = await Jeu.findById(partieId);
    if (!partie) {
      return res.status(404).json({ success: false, message: 'Partie non trouvée' });
    }

    // Vérifier que l'utilisateur fait partie de cette partie
    const estParticipant = partie.scores.utilisateur1.utilisateur.equals(userId) || 
                          partie.scores.utilisateur2.utilisateur.equals(userId);
    
    if (!estParticipant) {
      return res.status(403).json({ success: false, message: 'Vous ne faites pas partie de cette partie' });
    }

    partie.statut = 'abandonne';
    partie.dateFin = new Date();
    
    await partie.save();

    res.status(200).json({ success: true, message: 'Partie abandonnée' });

  } catch (error) {
    console.error('Erreur lors de l\'abandon de la partie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir les défis disponibles depuis la base de données
exports.getDeffisCouple = async (req, res) => {
  try {
    const defis = await Defi.find({ actif: true }).sort({ categorie: 1, points: 1 });
    res.status(200).json({ success: true, data: defis });
  } catch (error) {
    console.error('Erreur lors de la récupération des défis:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Compléter un défi
exports.completerDefi = async (req, res) => {
  try {
    const { defiId } = req.params;
    const { commentaire } = req.body;
    
    // Trouver le défi dans la base de données
    const defi = await Defi.findOne({ id: defiId, actif: true });
    if (!defi) {
      return res.status(404).json({ success: false, message: 'Défi non trouvé' });
    }
    
    // Ici vous pouvez sauvegarder la completion du défi en base de données
    // ou simplement retourner un succès pour l'instant
    
    res.status(200).json({ 
      success: true, 
      message: 'Défi complété avec succès!',
      data: {
        defiId,
        commentaire,
        points: defi.points,
        dateCompletion: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors de la completion du défi:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir les questions d'un type de jeu spécifique
exports.getQuestionsJeu = async (req, res) => {
  try {
    const { typeJeu } = req.params;
    
    const questions = await QuestionJeu.find({ typeJeu, actif: true });
    if (!questions || questions.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucune question trouvée pour ce type de jeu' });
    }
    
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir les statistiques globales des jeux
exports.getStatistiquesJeux = async (req, res) => {
  try {
    const userId = req.utilisateur.id;
    
    const stats = await Jeu.aggregate([
      {
        $match: {
          $or: [
            { 'scores.utilisateur1.utilisateur': new mongoose.Types.ObjectId(userId) },
            { 'scores.utilisateur2.utilisateur': new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$type',
          nombreParties: { $sum: 1 },
          partiesTerminees: {
            $sum: {
              $cond: [{ $eq: ['$statut', 'termine'] }, 1, 0]
            }
          },
          scoreTotal: {
            $sum: {
              $cond: [
                { $eq: ['$scores.utilisateur1.utilisateur', new mongoose.Types.ObjectId(userId)] },
                '$scores.utilisateur1.score',
                '$scores.utilisateur2.score'
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getJeuxDisponibles: exports.getJeuxDisponibles,
  getHistorique: exports.getHistorique,
  demarrerPartie: exports.demarrerPartie,
  soumettreReponse: exports.soumettreReponse,
  corrigerReponse: exports.corrigerReponse,
  getPartie: exports.getPartie,
  terminerPartie: exports.terminerPartie,
  abandonnerPartie: exports.abandonnerPartie,
  getDeffisCouple: exports.getDeffisCouple,
  completerDefi: exports.completerDefi,
  getQuestionsJeu: exports.getQuestionsJeu,
  getStatistiquesJeux: exports.getStatistiquesJeux
};