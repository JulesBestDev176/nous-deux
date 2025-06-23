// migrate-atlas.js - Script de migration pour MongoDB Atlas
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Schémas simplifiés intégrés
const jeuTypeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  difficulte: { type: String, required: true },
  duree: { type: String, required: true },
  needsCorrection: { type: Boolean, default: false },
  hasSubQuizzes: { type: Boolean, default: false },
  subQuizzes: [{
    id: String,
    nom: String,
    description: String,
    difficulte: String,
    duree: String,
    maxQuestions: Number
  }],
  minQuestions: { type: Number, default: 6 },
  maxQuestions: { type: Number, default: 10 },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

const questionJeuSchema = new mongoose.Schema({
  typeJeu: { type: String, required: true, index: true },
  questionText: { type: String, required: true },
  optionA: { type: String },
  optionB: { type: String },
  points: { type: Number, default: 10 },
  difficulte: { type: String, enum: ['Facile', 'Moyen', 'Difficile', 'Pro'] },
  categorie: { type: String },
  actif: { type: Boolean, default: true },
  reponduParSujet: { type: Boolean, default: false },
  reponduParDevineur: { type: Boolean, default: false },
  reponseSujet: { type: String, default: '' },
  reponseDevineur: { type: String, default: '' },
  estCorrect: { type: Boolean, default: null },
  corrigePar: { type: String, default: null }
}, { timestamps: true });

const defiSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  difficulte: { type: String, enum: ['Facile', 'Moyen', 'Difficile'], required: true },
  categorie: { type: String, required: true },
  icon: { type: String, required: true },
  actif: { type: Boolean, default: true }
}, { timestamps: true });

const JeuType = mongoose.model('JeuType', jeuTypeSchema);
const QuestionJeu = mongoose.model('QuestionJeu', questionJeuSchema);
const Defi = mongoose.model('Defi', defiSchema);

// Données à migrer
const donneesJeux = {
  jeux: [
    {
      id: "quiz-couple",
      nom: "Quiz de Couple",
      description: "À quel point connaissez-vous votre partenaire ?",
      icon: "BrainCircuit",
      color: "blue",
      difficulte: "Variable",
      duree: "10-30 min",
      needsCorrection: true,
      hasSubQuizzes: true,
      subQuizzes: [
        {
          id: "quiz-facile-1",
          nom: "Quiz Découverte - Niveau 1",
          description: "Les bases pour découvrir votre partenaire",
          difficulte: "Facile",
          duree: "8-10 min",
          maxQuestions: 6
        },
        {
          id: "quiz-facile-2",
          nom: "Quiz Découverte - Niveau 2",
          description: "Approfondissez vos connaissances",
          difficulte: "Facile",
          duree: "8-10 min",
          maxQuestions: 6
        },
        {
          id: "quiz-moyen-1",
          nom: "Quiz Connaissance - Niveau 1",
          description: "Pour les couples qui se connaissent déjà",
          difficulte: "Moyen",
          duree: "10-12 min",
          maxQuestions: 6
        },
        {
          id: "quiz-moyen-2",
          nom: "Quiz Connaissance - Niveau 2",
          description: "Explorez ses secrets et habitudes",
          difficulte: "Moyen",
          duree: "10-12 min",
          maxQuestions: 6
        },
        {
          id: "quiz-difficile-1",
          nom: "Quiz Expert - Niveau 1",
          description: "Pour les couples fusionnels",
          difficulte: "Difficile",
          duree: "12-15 min",
          maxQuestions: 6
        },
        {
          id: "quiz-difficile-2",
          nom: "Quiz Expert - Niveau 2",
          description: "Le niveau ultime de connaissance",
          difficulte: "Difficile",
          duree: "12-15 min",
          maxQuestions: 6
        },
        {
          id: "quiz-pro",
          nom: "Quiz Master Pro",
          description: "Réservé aux vrais experts de leur partenaire",
          difficulte: "Pro",
          duree: "15-20 min",
          maxQuestions: 6
        }
      ]
    },
    {
      id: "dilemmes",
      nom: "Dilemmes",
      description: "Que feriez-vous ? Découvrez les choix de votre partenaire",
      icon: "GitCompareArrows",
      color: "purple",
      difficulte: "Facile",
      duree: "10-15 min",
      needsCorrection: false,
      minQuestions: 6,
      maxQuestions: 10
    },
    {
      id: "plus-probable",
      nom: "Le plus probable",
      description: "Qui est le plus susceptible de... ?",
      icon: "Users",
      color: "green",
      difficulte: "Facile",
      duree: "10-15 min",
      needsCorrection: false,
      minQuestions: 8,
      maxQuestions: 12
    },
    {
      id: "preferences",
      nom: "Préférences",
      description: "Découvrez vos goûts et préférences mutuels",
      icon: "Heart",
      color: "red",
      difficulte: "Facile",
      duree: "10-15 min",
      needsCorrection: false,
      minQuestions: 6,
      maxQuestions: 8
    },
    {
      id: "tu-preferes",
      nom: "Tu préfères...",
      description: "Choix cornéliens entre deux options",
      icon: "MessageSquare",
      color: "yellow",
      difficulte: "Facile",
      duree: "5-10 min",
      needsCorrection: false,
      minQuestions: 8,
      maxQuestions: 15
    }
  ],
  questions: {
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
      "Quel est le sport préféré de votre partenaire ?",
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
      "Préférez-vous les vacances à la plage ou à la montagne ?"
    ],
    "plus-probable": [
      "Qui est le plus susceptible d'oublier un anniversaire ?",
      "Qui est le plus susceptible de danser en public ?",
      "Qui est le plus susceptible de pleurer devant un film ?",
      "Qui est le plus susceptible de se perdre même avec un GPS ?",
      "Qui est le plus susceptible de manger le dernier cookie ?"
    ],
    "preferences": [
      "Quel type de film préférez-vous regarder ensemble ?",
      "Quelle est votre saison préférée et pourquoi ?",
      "Préférez-vous les sorties sportives ou culturelles ?",
      "Quel est votre style de vacances idéal ?",
      "Préférez-vous les soirées calmes ou animées ?"
    ],
    "tu-preferes": [
      "Tu préfères... un weekend à la montagne ou un weekend à la mer ?",
      "Tu préfères... cuisiner ensemble ou commander à emporter ?",
      "Tu préfères... sortir avec des amis ou rester à deux à la maison ?",
      "Tu préfères... voyager de façon spontanée ou planifier minutieusement ?",
      "Tu préfères... regarder un film d'action ou une comédie romantique ?"
    ]
  },
  defis: [
    {
      id: "defi-1",
      titre: "Cuisiner ensemble",
      description: "Préparez un repas ensemble sans suivre de recette",
      points: 20,
      difficulte: "Moyen",
      categorie: "Cuisine",
      icon: "👨‍🍳"
    },
    {
      id: "defi-2",
      titre: "Photo créative",
      description: "Prenez une photo créative de vous deux dans un lieu public",
      points: 15,
      difficulte: "Facile",
      categorie: "Photo",
      icon: "📸"
    },
    {
      id: "defi-3",
      titre: "Danse improvisée",
      description: "Dansez ensemble sur votre chanson préférée pendant 3 minutes",
      points: 10,
      difficulte: "Facile",
      categorie: "Sortie",
      icon: "💃"
    }
  ]
};

async function migrer() {
  try {
    console.log('🚀 Début de la migration vers MongoDB Atlas...\n');

    // Vérifier l'URI
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI non trouvé dans le fichier .env');
    }

    console.log('📡 Connexion à MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB Atlas\n');

    // Nettoyer les collections existantes
    console.log('🧹 Nettoyage des collections...');
    await JeuType.deleteMany({});
    await QuestionJeu.deleteMany({});
    await Defi.deleteMany({});

    // Migrer les jeux
    console.log('🎮 Migration des types de jeux...');
    for (const jeu of donneesJeux.jeux) {
      await JeuType.create(jeu);
      console.log(`✅ Jeu "${jeu.nom}" migré`);
    }

    // Migrer les questions
    console.log('\n❓ Migration des questions...');
    let totalQuestions = 0;
    for (const [typeJeu, questions] of Object.entries(donneesJeux.questions)) {
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

        // Correction quiz-couple : initialiser tous les champs de réponse
        if (typeJeu.startsWith('quiz-')) {
          questionData.reponduParSujet = false;
          questionData.reponduParDevineur = false;
          questionData.reponseSujet = '';
          questionData.reponseDevineur = '';
          questionData.estCorrect = null;
          questionData.corrigePar = null;
        }

        await QuestionJeu.create(questionData);
        totalQuestions++;
      }
      console.log(`✅ ${questions.length} questions pour "${typeJeu}"`);
    }

    // Migrer les défis
    console.log('\n⚡ Migration des défis...');
    for (const defi of donneesJeux.defis) {
      await Defi.create(defi);
      console.log(`✅ Défi "${defi.titre}" migré`);
    }

    // Statistiques finales
    const statsJeux = await JeuType.countDocuments();
    const statsQuestions = await QuestionJeu.countDocuments();
    const statsDefis = await Defi.countDocuments();

    console.log('\n🎉 Migration terminée avec succès !');
    console.log('\n📊 Statistiques :');
    console.log(`- Types de jeux : ${statsJeux}`);
    console.log(`- Questions : ${statsQuestions}`);
    console.log(`- Défis : ${statsDefis}`);

  } catch (error) {
    console.error('\n❌ Erreur de migration :', error.message);
    throw error;
  } finally {
    await mongoose.connection.close();//hhdh
    console.log('\n📡 Connexion fermée');
  }
}

// Exécuter la migration
if (require.main === module) {
  migrer()
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Échec de la migration :', error);
      process.exit(1);
    });
}

module.exports = migrer;