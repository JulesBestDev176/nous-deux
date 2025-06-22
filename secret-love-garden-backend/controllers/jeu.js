const Jeu = require('../models/Jeu');
const Utilisateur = require('../models/Utilisateur');

// Liste des jeux disponibles
const jeux = [
  {
    id: 'quiz-couple',
    nom: 'Quiz Couple',
    description: 'Testez vos connaissances sur votre partenaire !',
    icon: 'BrainCircuit'
  },
  {
    id: 'dilemmes',
    nom: 'Dilemmes',
    description: 'Que feriez-vous ? Découvrez les choix de votre partenaire.',
    icon: 'GitCompareArrows'
  },
  {
    id: 'plus-probable',
    nom: 'Le plus probable',
    description: 'Qui est le plus susceptible de... ?',
    icon: 'Users'
  }
];

// Questions prédéfinies pour le quiz couple
const questionsQuiz = [
  { question: "Quelle est sa plus grande peur ?", points: 10 },
  { question: "Quel est son langage d'amour principal ?", points: 10 },
  { question: "Quelle est la destination de ses rêves ?", points: 10 },
  { question: "S'il/elle pouvait avoir un super-pouvoir, lequel serait-ce ?", points: 10 },
  { question: "Quel est son film ou sa série préféré(e) de tous les temps ?", points: 10 },
];

// Questions pour le quiz de relation
const questionsRelation = [
  { question: "Comment vous êtes-vous rencontrés ?", points: 10 },
  { question: "Quel est votre endroit préféré pour sortir ensemble ?", points: 10 },
  { question: "Quelle est votre chanson préférée en couple ?", points: 10 },
  { question: "Quel est le trait de caractère que vous préférez chez votre partenaire ?", points: 10 },
  { question: "Quel est votre projet de couple le plus important ?", points: 10 },
];

// Dilemmes prédéfinis
const dilemmes = [
  { question: "Préférez-vous une soirée à la maison ou une sortie en ville ?", points: 5 },
  { question: "Choisiriez-vous de voyager dans le passé ou dans le futur ?", points: 5 },
  { question: "Préférez-vous être riche mais malheureux ou pauvre mais heureux ?", points: 5 },
  { question: "Choisiriez-vous de pouvoir voler ou devenir invisible ?", points: 5 },
  { question: "Préférez-vous les vacances à la plage ou à la montagne ?", points: 5 },
];

// Défis pour couples
const defisCouple = [
  {
    id: 'defi-1',
    titre: 'Cuisiner ensemble',
    description: 'Préparez un repas ensemble sans suivre de recette',
    points: 20,
    statut: 'disponible'
  },
  {
    id: 'defi-2',
    titre: 'Photo créative',
    description: 'Prenez une photo créative de vous deux dans un lieu public',
    points: 15,
    statut: 'disponible'
  },
  {
    id: 'defi-3',
    titre: 'Danse improvisée',
    description: 'Dansez ensemble sur votre chanson préférée pendant 3 minutes',
    points: 10,
    statut: 'disponible'
  },
  {
    id: 'defi-4',
    titre: 'Lettre d\'amour',
    description: 'Écrivez-vous mutuellement une lettre d\'amour à la main',
    points: 25,
    statut: 'disponible'
  }
];

// Questions de préférences
const questionsPreferences = [
  { question: "Quel type de film préférez-vous regarder ensemble ?", points: 5 },
  { question: "Quelle est votre saison préférée et pourquoi ?", points: 5 },
  { question: "Préférez-vous les sorties sportives ou culturelles ?", points: 5 },
  { question: "Quel est votre style de vacances idéal ?", points: 5 },
  { question: "Préférez-vous les soirées calmes ou animées ?", points: 5 },
];

// Obtenir les jeux disponibles
exports.getJeuxDisponibles = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: jeux });
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir l'historique des parties
exports.getHistorique = async (req, res) => {
  try {
    const parties = await Jeu.find({
      $or: [
        { 'scores.utilisateur1.utilisateur': req.utilisateur.id },
        { 'scores.utilisateur2.utilisateur': req.utilisateur.id }
      ],
      statut: 'termine'
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

// Démarrer une nouvelle partie
exports.demarrerPartie = async (req, res) => {
  try {
    const { typeJeu } = req.body;
    
    if (!typeJeu) {
      return res.status(400).json({ success: false, message: 'Type de jeu requis.' });
    }
    
    const utilisateur = await Utilisateur.findById(req.utilisateur.id);
    if (!utilisateur || !utilisateur.partenaire) {
      return res.status(400).json({ success: false, message: 'Partenaire non trouvé.' });
    }

    // Vérifier s'il y a déjà une partie en cours
    const partieExistante = await Jeu.findOne({
        $or: [
            { 'scores.utilisateur1.utilisateur': req.utilisateur.id },
            { 'scores.utilisateur2.utilisateur': req.utilisateur.id }
        ],
        statut: { $in: ['en_attente', 'en_cours'] },
        type: typeJeu
    });

    if (partieExistante) {
        return res.status(409).json({ 
          success: false, 
          message: 'Une partie de ce type est déjà en cours.', 
          data: partieExistante 
        });
    }

    // Générer les questions selon le type de jeu
    let questions = [];
    switch (typeJeu) {
      case 'quiz-couple':
        questions = questionsQuiz.map(q => ({
          question: q.question,
          points: q.points
        }));
        break;
      case 'dilemmes':
        questions = dilemmes.map(q => ({
          question: q.question,
          points: q.points
        }));
        break;
      case 'plus-probable':
        questions = [
          { question: "Qui est le plus susceptible de se lever tôt ?", points: 5 },
          { question: "Qui est le plus susceptible de danser en public ?", points: 5 },
          { question: "Qui est le plus susceptible de cuisiner un repas romantique ?", points: 5 },
          { question: "Qui est le plus susceptible d'oublier un anniversaire ?", points: 5 },
          { question: "Qui est le plus susceptible de faire une surprise ?", points: 5 }
        ];
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Type de jeu non reconnu.' 
        });
    }

    const nouvellePartie = new Jeu({
      type: typeJeu,
      createur: req.utilisateur.id,
      statut: 'en_cours',
      questions,
      scores: {
        utilisateur1: { utilisateur: req.utilisateur.id, score: 0 },
        utilisateur2: { utilisateur: utilisateur.partenaire, score: 0 }
      }
    });

    await nouvellePartie.save();
    
    // Peupler les données utilisateur pour la réponse
    await nouvellePartie.populate('scores.utilisateur1.utilisateur', 'nom');
    await nouvellePartie.populate('scores.utilisateur2.utilisateur', 'nom');
    
    res.status(201).json({ success: true, data: nouvellePartie });
  } catch (error) {
    console.error('Erreur lors du démarrage de la partie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
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

    // Vérifier que l'utilisateur fait partie de cette partie
    const userId = req.utilisateur.id;
    const isParticipant = partie.scores.utilisateur1.utilisateur._id.toString() === userId ||
                         partie.scores.utilisateur2.utilisateur._id.toString() === userId;
    
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Accès non autorisé à cette partie' });
    }

    res.status(200).json({ success: true, data: partie });
  } catch (error) {
    console.error('Erreur lors de la récupération de la partie:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Soumettre une réponse
exports.soumettreReponse = async (req, res) => {
  try {
    const { partieId } = req.params;
    const { reponse, indexQuestion } = req.body;
    const userId = req.utilisateur.id;

    if (!reponse || indexQuestion === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Réponse et index de question requis.' 
      });
    }

    const partie = await Jeu.findById(partieId);
    if (!partie) {
      return res.status(404).json({ success: false, message: 'Partie non trouvée' });
    }

    if (partie.statut !== 'en_cours') {
        return res.status(400).json({ success: false, message: 'Cette partie est terminée.' });
    }

    if (indexQuestion >= partie.questions.length || indexQuestion < 0) {
      return res.status(400).json({ success: false, message: 'Index de question invalide.' });
    }

    const isUtilisateur1 = partie.scores.utilisateur1.utilisateur.toString() === userId;
    const champReponse = isUtilisateur1 ? 'reponseUtilisateur1' : 'reponseUtilisateur2';

    // Vérifier si l'utilisateur a déjà répondu
    if (partie.questions[indexQuestion][champReponse]) {
        return res.status(400).json({ 
          success: false, 
          message: 'Vous avez déjà répondu à cette question.' 
        });
    }

    // Enregistrer la réponse
    partie.questions[indexQuestion][champReponse] = reponse;

    // Vérifier si les deux utilisateurs ont répondu à toutes les questions
    const toutesLesQuestionsRepondues = partie.questions.every(q => 
      q.reponseUtilisateur1 && q.reponseUtilisateur2
    );

    if (toutesLesQuestionsRepondues) {
      partie.statut = 'termine';
      partie.dateFin = new Date();
      
      // Calculer les scores basiques (peut être amélioré selon la logique métier)
      partie.scores.utilisateur1.score = partie.questions.length * 5;
      partie.scores.utilisateur2.score = partie.questions.length * 5;
    }
    
    await partie.save();
    
    // Peupler les données pour la réponse
    await partie.populate('scores.utilisateur1.utilisateur', 'nom');
    await partie.populate('scores.utilisateur2.utilisateur', 'nom');
    
    res.status(200).json({ success: true, data: partie });
  } catch (error) {
    console.error('Erreur lors de la soumission de la réponse:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir les questions du quiz de relation
exports.getQuizRelation = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: questionsRelation });
  } catch (error) {
    console.error('Erreur lors de la récupération du quiz relation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir les défis disponibles
exports.getDeffisCouple = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: defisCouple });
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
    
    // Cette fonctionnalité peut être étendue pour gérer les images uploadées
    // et créer une entrée dans la base de données pour le défi complété
    
    res.status(200).json({ 
      success: true, 
      message: 'Défi complété avec succès!',
      data: {
        defiId,
        commentaire,
        dateCompletion: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors de la completion du défi:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir les questions de préférences
exports.getQuestionsPreferences = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: questionsPreferences });
  } catch (error) {
    console.error('Erreur lors de la récupération des questions de préférences:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};