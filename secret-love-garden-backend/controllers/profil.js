// controllers/profil.js
const ProfilCouple = require('../models/ProfilCouple');
const Utilisateur = require('../models/Utilisateur');

// Tests de compatibilité prédéfinis
const testsCompatibilite = {
  loveLanguages: [
    {
      question: "Comment préférez-vous recevoir de l'affection ?",
      options: [
        { value: "mots", label: "Mots d'affirmation" },
        { value: "contact", label: "Contact physique" },
        { value: "cadeaux", label: "Cadeaux" },
        { value: "services", label: "Services rendus" },
        { value: "temps", label: "Temps de qualité" }
      ]
    }
  ]
};

// Obtenir ou créer le profil couple
exports.getProfilCouple = async (req, res) => {
  try {
    // Trouver le partenaire
    const partenaire = await Utilisateur.findOne({ 
      _id: { $ne: req.utilisateur.id } 
    });

    if (!partenaire) {
      return res.status(404).json({ 
        success: false,
        message: 'Partenaire non trouvé' 
      });
    }

    let profil = await ProfilCouple.findOne({
      $or: [
        { utilisateur1: req.utilisateur.id, utilisateur2: partenaire._id },
        { utilisateur1: partenaire._id, utilisateur2: req.utilisateur.id }
      ]
    }).populate('utilisateur1', 'nom').populate('utilisateur2', 'nom');

    // Créer le profil s'il n'existe pas
    if (!profil) {
      profil = await ProfilCouple.create({
        utilisateur1: req.utilisateur.id,
        utilisateur2: partenaire._id,
        statusRelation: 'couple'
      });
      await profil.populate('utilisateur1', 'nom');
      await profil.populate('utilisateur2', 'nom');
    }

    res.status(200).json({
      success: true,
      data: profil
    });

  } catch (error) {
    console.error('Erreur récupération profil couple:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil couple'
    });
  }
};

// Faire un test de compatibilité
exports.faireLoveLanguagesTest = async (req, res) => {
  try {
    const { reponses } = req.body;

    // Calculer les scores
    const scores = {
      mots: 0,
      contact: 0,
      cadeaux: 0,
      services: 0,
      temps: 0
    };

    reponses.forEach(reponse => {
      if (scores.hasOwnProperty(reponse)) {
        scores[reponse] += 1;
      }
    });

    // Déterminer le langage principal et secondaire
    const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
    const principal = sortedScores[0][0];
    const secondaire = sortedScores[1][0];

    // Trouver ou créer le profil couple
    const partenaire = await Utilisateur.findOne({ 
      _id: { $ne: req.utilisateur.id } 
    });

    let profil = await ProfilCouple.findOne({
      $or: [
        { utilisateur1: req.utilisateur.id, utilisateur2: partenaire._id },
        { utilisateur1: partenaire._id, utilisateur2: req.utilisateur.id }
      ]
    });

    if (!profil) {
      profil = await ProfilCouple.create({
        utilisateur1: req.utilisateur.id,
        utilisateur2: partenaire._id
      });
    }

    // Déterminer si c'est l'utilisateur 1 ou 2
    const isUtilisateur1 = profil.utilisateur1.toString() === req.utilisateur.id;
    const champUtilisateur = isUtilisateur1 ? 'utilisateur1' : 'utilisateur2';

    // Mettre à jour les langages d'amour
    if (!profil.langagesAmour) {
      profil.langagesAmour = {};
    }
    
    profil.langagesAmour[champUtilisateur] = {
      principal,
      secondaire,
      scores
    };

    // Ajouter le résultat du test
    const resultatTest = {
      typeTest: 'love-languages',
      reponses,
      score: Math.max(...Object.values(scores)) * 20, // Score sur 100
      interpretation: `Votre langage d'amour principal est : ${principal}`,
      conseils: [
        `Privilégiez ${principal} dans vos interactions`,
        `N'oubliez pas votre langage secondaire : ${secondaire}`
      ]
    };

    profil.resultatsTests.push(resultatTest);
    await profil.save();

    res.status(200).json({
      success: true,
      data: {
        principal,
        secondaire,
        scores,
        resultatTest
      }
    });

  } catch (error) {
    console.error('Erreur test love languages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test des langages d\'amour'
    });
  }
};

// Obtenir les questions de test
exports.getTestQuestions = async (req, res) => {
  try {
    const { typeTest } = req.params;
    
    if (testsCompatibilite[typeTest]) {
      res.status(200).json({
        success: true,
        data: testsCompatibilite[typeTest]
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Type de test non trouvé'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des questions'
    });
  }
};