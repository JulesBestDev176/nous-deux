const mongoose = require('mongoose');
const JeuType = require('../models/JeuType');
const QuestionJeu = require('../models/QuestionJeu');
const Defi = require('../models/Defi');

// Données à migrer
const jeuxData = {
  "jeux": [
    {
      "id": "quiz-couple",
      "nom": "Quiz de Couple",
      "description": "À quel point connaissez-vous votre partenaire ?",
      "icon": "BrainCircuit",
      "color": "blue",
      "difficulte": "Variable",
      "duree": "10-30 min",
      "needsCorrection": true,
      "hasSubQuizzes": true,
      "subQuizzes": [
        {
          "id": "quiz-facile-1",
          "nom": "Quiz Découverte - Niveau 1",
          "description": "Les bases pour découvrir votre partenaire",
          "difficulte": "Facile",
          "duree": "8-10 min",
          "maxQuestions": 6
        },
        {
          "id": "quiz-facile-2", 
          "nom": "Quiz Découverte - Niveau 2",
          "description": "Approfondissez vos connaissances",
          "difficulte": "Facile",
          "duree": "8-10 min",
          "maxQuestions": 6
        },
        {
          "id": "quiz-moyen-1",
          "nom": "Quiz Connaissance - Niveau 1",
          "description": "Pour les couples qui se connaissent déjà",
          "difficulte": "Moyen",
          "duree": "10-12 min",
          "maxQuestions": 6
        },
        {
          "id": "quiz-moyen-2",
          "nom": "Quiz Connaissance - Niveau 2", 
          "description": "Explorez ses secrets et habitudes",
          "difficulte": "Moyen",
          "duree": "10-12 min",
          "maxQuestions": 6
        },
        {
          "id": "quiz-difficile-1",
          "nom": "Quiz Expert - Niveau 1",
          "description": "Pour les couples fusionnels",
          "difficulte": "Difficile",
          "duree": "12-15 min",
          "maxQuestions": 6
        },
        {
          "id": "quiz-difficile-2",
          "nom": "Quiz Expert - Niveau 2",
          "description": "Le niveau ultime de connaissance",
          "difficulte": "Difficile", 
          "duree": "12-15 min",
          "maxQuestions": 6
        },
        {
          "id": "quiz-pro",
          "nom": "Quiz Master Pro",
          "description": "Réservé aux vrais experts de leur partenaire",
          "difficulte": "Pro",
          "duree": "15-20 min",
          "maxQuestions": 6
        }
      ]
    },
    {
      "id": "dilemmes",
      "nom": "Dilemmes",
      "description": "Que feriez-vous ? Découvrez les choix de votre partenaire",
      "icon": "GitCompareArrows",
      "color": "purple",
      "difficulte": "Facile",
      "duree": "10-15 min",
      "needsCorrection": false,
      "minQuestions": 6,
      "maxQuestions": 10
    },
    {
      "id": "plus-probable",
      "nom": "Le plus probable",
      "description": "Qui est le plus susceptible de... ?",
      "icon": "Users",
      "color": "green",
      "difficulte": "Facile",
      "duree": "10-15 min",
      "needsCorrection": false,
      "minQuestions": 8,
      "maxQuestions": 12
    },
    {
      "id": "preferences",
      "nom": "Préférences",
      "description": "Découvrez vos goûts et préférences mutuels",
      "icon": "Heart",
      "color": "red",
      "difficulte": "Facile",
      "duree": "10-15 min",
      "needsCorrection": false,
      "minQuestions": 6,
      "maxQuestions": 8
    },
    {
      "id": "tu-preferes",
      "nom": "Tu préfères...",
      "description": "Choix cornéliens entre deux options",
      "icon": "MessageSquare",
      "color": "yellow",
      "difficulte": "Facile",
      "duree": "5-10 min",
      "needsCorrection": false,
      "minQuestions": 8,
      "maxQuestions": 15
    },
    {
      "id": "memory-souvenirs",
      "nom": "Memory des souvenirs",
      "description": "Testez vos souvenirs communs",
      "icon": "Camera",
      "color": "orange",
      "difficulte": "Moyen",
      "duree": "15-20 min",
      "needsCorrection": true,
      "minQuestions": 6,
      "maxQuestions": 10
    },
    {
      "id": "association-mots",
      "nom": "Association de mots",
      "description": "Trouvez les mots qui vous unissent",
      "icon": "Lightbulb",
      "color": "teal",
      "difficulte": "Facile",
      "duree": "8-12 min",
      "needsCorrection": false,
      "minQuestions": 10,
      "maxQuestions": 15
    },
    {
      "id": "devine-emotion",
      "nom": "Devine l'émotion",
      "description": "Identifiez les émotions de votre partenaire",
      "icon": "Smile",
      "color": "pink",
      "difficulte": "Moyen",
      "duree": "12-18 min",
      "needsCorrection": true,
      "minQuestions": 8,
      "maxQuestions": 12
    },
    {
      "id": "reactions",
      "nom": "Comment réagiriez-vous ?",
      "description": "Situations hypothétiques à résoudre",
      "icon": "Zap",
      "color": "indigo",
      "difficulte": "Difficile",
      "duree": "20-25 min",
      "needsCorrection": false,
      "minQuestions": 6,
      "maxQuestions": 10
    },
    {
      "id": "secrets-desires",
      "nom": "Secrets et Désirs",
      "description": "Découvrez les envies cachées de votre partenaire",
      "icon": "Key",
      "color": "slate",
      "difficulte": "Difficile",
      "duree": "15-25 min",
      "needsCorrection": true,
      "minQuestions": 6,
      "maxQuestions": 8
    }
  ],
  "questions": {
    "quiz-facile-1": [
      "Quelle est la couleur préférée de votre partenaire ?",
      "Quel est le plat préféré de votre partenaire ?",
      "Quelle est la saison préférée de votre partenaire ?",
      "Quel type de film votre partenaire préfère-t-il/elle regarder ?",
      "Quelle est l'activité de loisir favorite de votre partenaire ?",
      "Quel est l'animal préféré de votre partenaire ?"
    ],
    "quiz-facile-2": [
      "Quelle est la boisson préférée de votre partenaire ?",
      "Dans quel pays votre partenaire aimerait-il/elle voyager ?",
      "Quel genre de musique votre partenaire écoute-t-il/elle le plus ?",
      "Quel est le sport préféré de votre partenaire (à regarder ou pratiquer) ?",
      "Quelle est l'heure de coucher habituelle de votre partenaire ?",
      "Quel est le type de vacances idéal pour votre partenaire ?"
    ],
    "quiz-moyen-1": [
      "Quel est le plus grand rêve de votre partenaire ?",
      "Quelle est la plus grande peur de votre partenaire ?",
      "Quel trait de caractère votre partenaire préfère-t-il/elle chez lui/elle ?",
      "Quel est le souvenir d'enfance le plus marquant de votre partenaire ?",
      "Quelle est l'ambition professionnelle de votre partenaire ?",
      "Quel est le plus beau compliment qu'on ait fait à votre partenaire ?"
    ],
    "quiz-moyen-2": [
      "Quelle habitude secrète a votre partenaire ?",
      "Quel est le livre ou film qui a le plus marqué votre partenaire ?",
      "Dans quelle situation votre partenaire se sent-il/elle le plus confiant(e) ?",
      "Quel est le cadeau idéal pour faire plaisir à votre partenaire ?",
      "Quelle est la tradition familiale la plus importante pour votre partenaire ?",
      "Quel changement votre partenaire aimerait-il/elle voir dans le monde ?"
    ],
    "quiz-difficile-1": [
      "Quel est le secret le mieux gardé de votre partenaire ?",
      "Quelle est la plus grande leçon de vie que votre partenaire a apprise ?",
      "Quel événement a le plus changé la vision du monde de votre partenaire ?",
      "Quelle est la plus grande fierté personnelle de votre partenaire ?",
      "Quel est le regret le plus profond de votre partenaire ?",
      "Quelle valeur votre partenaire ne sacrifierait jamais ?"
    ],
    "quiz-difficile-2": [
      "Quel est le rêve impossible que votre partenaire garde en secret ?",
      "Dans quel moment votre partenaire s'est-il/elle senti(e) le plus vulnérable ?",
      "Quelle personne a eu le plus d'influence sur votre partenaire ?",
      "Quel aspect de sa personnalité votre partenaire aimerait-il/elle changer ?",
      "Quelle est la plus belle déclaration d'amour qu'ait reçue votre partenaire ?",
      "Quel serait le métier de rêve de votre partenaire dans une autre vie ?"
    ],
    "quiz-pro": [
      "Quel est le fantasme le plus secret de votre partenaire ?",
      "Quelle pensée traverse l'esprit de votre partenaire juste avant de s'endormir ?",
      "Quel est le mensonge blanc que votre partenaire dit le plus souvent ?",
      "Dans quelle situation votre partenaire se sent-il/elle le plus authentique ?",
      "Quelle est la chose que votre partenaire n'oserait jamais avouer à ses parents ?",
      "Quel serait le dernier mot que votre partenaire voudrait dire s'il/elle n'avait qu'une phrase ?"
    ],
    "dilemmes": [
      "Préférez-vous une soirée à la maison ou une sortie en ville ?",
      "Choisiriez-vous de voyager dans le passé ou dans le futur ?",
      "Préférez-vous être riche mais malheureux ou pauvre mais heureux ?",
      "Choisiriez-vous de pouvoir voler ou devenir invisible ?",
      "Préférez-vous les vacances à la plage ou à la montagne ?",
      "Choisiriez-vous de connaître votre avenir ou de pouvoir changer votre passé ?",
      "Préférez-vous vivre dans une grande ville ou à la campagne ?",
      "Choisiriez-vous de perdre la vue ou l'ouïe ?",
      "Préférez-vous être toujours en retard ou toujours trop en avance ?",
      "Choisiriez-vous de pouvoir lire dans les pensées ou de prédire l'avenir ?"
    ],
    "plus-probable": [
      "Qui est le plus susceptible d'oublier un anniversaire ?",
      "Qui est le plus susceptible de danser en public ?",
      "Qui est le plus susceptible de pleurer devant un film ?",
      "Qui est le plus susceptible de se perdre même avec un GPS ?",
      "Qui est le plus susceptible de manger le dernier cookie ?",
      "Qui est le plus susceptible de rester en pyjama toute la journée ?",
      "Qui est le plus susceptible de faire du bénévolat ?",
      "Qui est le plus susceptible de devenir célèbre ?",
      "Qui est le plus susceptible de collectionner quelque chose d'étrange ?",
      "Qui est le plus susceptible de parler aux animaux ?"
    ],
    "preferences": [
      "Quel type de film préférez-vous regarder ensemble ?",
      "Quelle est votre saison préférée et pourquoi ?",
      "Préférez-vous les sorties sportives ou culturelles ?",
      "Quel est votre style de vacances idéal ?",
      "Préférez-vous les soirées calmes ou animées ?",
      "Quelle cuisine du monde préférez-vous ?",
      "Préférez-vous les animaux de compagnie ou pas ?",
      "Quel type de musique écoutez-vous le plus ?"
    ],
    "tu-preferes": [
      "Tu préfères... un weekend à la montagne ou un weekend à la mer ?",
      "Tu préfères... cuisiner ensemble ou commander à emporter ?",
      "Tu préfères... sortir avec des amis ou rester à deux à la maison ?",
      "Tu préfères... voyager de façon spontanée ou planifier minutieusement ?",
      "Tu préfères... regarder un film d'action ou une comédie romantique ?",
      "Tu préfères... te lever tôt ou te coucher tard ?",
      "Tu préfères... avoir beaucoup d'amis ou quelques amis proches ?",
      "Tu préfères... vivre en appartement ou en maison ?",
      "Tu préfères... l'été ou l'hiver ?",
      "Tu préfères... les chats ou les chiens ?"
    ],
    "memory-souvenirs": [
      "Où nous sommes-nous rencontrés pour la première fois ?",
      "Quel était notre premier rendez-vous ?",
      "Quelle est la première chose que vous avez remarquée chez moi ?",
      "Quel est notre premier voyage ensemble ?",
      "Quelle est la première dispute qu'on a eue ?",
      "Quelle est notre chanson préférée en couple ?",
      "Quel est le plus beau cadeau que je vous ai offert ?",
      "Quelle est votre phrase fétiche que je dis souvent ?"
    ],
    "association-mots": [
      "Quel mot vous vient à l'esprit quand je dis 'amour' ?",
      "Quel mot associez-vous à 'voyage' ?",
      "Quel mot vous évoque 'bonheur' ?",
      "Quel mot pensez-vous quand je dis 'famille' ?",
      "Quel mot associez-vous à 'rêve' ?",
      "Quel mot vous vient avec 'liberté' ?",
      "Quel mot évoque 'succès' pour vous ?",
      "Quel mot associez-vous à 'aventure' ?"
    ],
    "devine-emotion": [
      "Comment votre partenaire se sent quand il/elle rentre du travail stressé(e) ?",
      "Quelle émotion votre partenaire ressent le plus souvent le dimanche ?",
      "Comment votre partenaire réagit quand quelque chose ne se passe pas comme prévu ?",
      "Quelle est l'émotion principale de votre partenaire quand il/elle vous voit ?",
      "Comment votre partenaire se sent lors des réunions de famille ?",
      "Quelle émotion domine chez votre partenaire quand il/elle regarde un film triste ?"
    ],
    "reactions": [
      "Comment votre partenaire réagirait s'il/elle gagnait un million d'euros ?",
      "Que ferait votre partenaire s'il/elle découvrait une infidélité ?",
      "Comment votre partenaire réagirait s'il/elle avait 24h pour vivre ?",
      "Que ferait votre partenaire si on critiquait son/sa partenaire ?",
      "Comment votre partenaire réagirait s'il/elle perdait son emploi ?",
      "Que ferait votre partenaire s'il/elle découvrait un secret de famille ?"
    ],
    "secrets-desires": [
      "Quel est le rêve secret de votre partenaire qu'il/elle n'ose pas avouer ?",
      "Quelle expérience votre partenaire aimerait-il/elle vivre avant de mourir ?",
      "Quel est le fantasme le plus fou de votre partenaire ?",
      "Quelle personnalité votre partenaire aimerait-il/elle rencontrer ?",
      "Quel changement votre partenaire aimerait-il/elle faire dans sa vie ?",
      "Quel secret votre partenaire garde-t-il/elle depuis l'enfance ?"
    ]
  },
  "defis": [
    {
      "id": "defi-1",
      "titre": "Cuisiner ensemble",
      "description": "Préparez un repas ensemble sans suivre de recette",
      "points": 20,
      "difficulte": "Moyen",
      "categorie": "Cuisine",
      "icon": "👨‍🍳"
    },
    {
      "id": "defi-2",
      "titre": "Photo créative",
      "description": "Prenez une photo créative de vous deux dans un lieu public",
      "points": 15,
      "difficulte": "Facile",
      "categorie": "Photo",
      "icon": "📸"
    },
    {
      "id": "defi-3",
      "titre": "Danse improvisée",
      "description": "Dansez ensemble sur votre chanson préférée pendant 3 minutes",
      "points": 10,
      "difficulte": "Facile",
      "categorie": "Sortie",
      "icon": "💃"
    },
    {
      "id": "defi-4",
      "titre": "Lettre d'amour",
      "description": "Écrivez-vous mutuellement une lettre d'amour à la main",
      "points": 25,
      "difficulte": "Difficile",
      "categorie": "Romantique",
      "icon": "💌"
    },
    {
      "id": "defi-5",
      "titre": "Activité sportive",
      "description": "Faites ensemble un sport que vous n'avez jamais pratiqué",
      "points": 30,
      "difficulte": "Difficile",
      "categorie": "Sport",
      "icon": "⚽"
    },
    {
      "id": "defi-6",
      "titre": "Surprise petit-déjeuner",
      "description": "Préparez le petit-déjeuner surprise pour votre partenaire",
      "points": 12,
      "difficulte": "Facile",
      "categorie": "Romantique",
      "icon": "🥐"
    }
  ]
};

async function migrerDonnees() {
  try {
    console.log('🚀 Début de la migration des données...');

    // Connecter à MongoDB si pas déjà connecté
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/votre-db');
    }

    // 1. Nettoyer les collections existantes
    console.log('🧹 Nettoyage des collections...');
    await JeuType.deleteMany({});
    await QuestionJeu.deleteMany({});
    await Defi.deleteMany({});

    // 2. Migrer les types de jeux
    console.log('🎮 Migration des types de jeux...');
    for (const jeu of jeuxData.jeux) {
      await JeuType.create(jeu);
      console.log(`✅ Type de jeu "${jeu.nom}" migré`);
    }

    // 3. Migrer les questions
    console.log('❓ Migration des questions...');
    for (const [typeJeu, questions] of Object.entries(jeuxData.questions)) {
      for (const questionText of questions) {
        let questionData = {
          typeJeu,
          questionText,
          points: typeJeu.startsWith('quiz-') ? 10 : 5
        };

        // Traitement spécial pour "tu-preferes"
        if (typeJeu === 'tu-preferes' && questionText.includes(' ou ')) {
          const parts = questionText.split(' ou ');
          questionData.optionA = parts[0].replace('Tu préfères... ', '');
          questionData.optionB = parts[1]?.replace(' ?', '') || 'Autre option';
          questionData.questionText = questionData.optionA;
        }

        await QuestionJeu.create(questionData);
      }
      console.log(`✅ ${questions.length} questions pour "${typeJeu}" migrées`);
    }

    // 4. Migrer les défis
    console.log('⚡ Migration des défis...');
    for (const defi of jeuxData.defis) {
      await Defi.create(defi);
      console.log(`✅ Défi "${defi.titre}" migré`);
    }

    console.log('🎉 Migration terminée avec succès !');
    
    // Afficher les statistiques
    const statsJeux = await JeuType.countDocuments();
    const statsQuestions = await QuestionJeu.countDocuments();
    const statsDefis = await Defi.countDocuments();
    
    console.log('\n📊 Statistiques de migration :');
    console.log(`- Types de jeux : ${statsJeux}`);
    console.log(`- Questions : ${statsQuestions}`);
    console.log(`- Défis : ${statsDefis}`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    throw error;
  }
}

// Si le script est exécuté directement
if (require.main === module) {
  migrerDonnees()
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur de migration :', error);
      process.exit(1);
    });
}

module.exports = { migrerDonnees };