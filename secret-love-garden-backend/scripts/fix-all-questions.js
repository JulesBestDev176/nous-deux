const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Jeu = require('../models/Jeu');
const Reponse = require('../models/Reponse');

async function fixAllQuestions() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Correction questionsSimples
  const partiesSimples = await Jeu.find({ 'questionsSimples.0': { $exists: true } });
  let totalSimples = 0;
  for (const partie of partiesSimples) {
    let modified = false;
    for (const q of partie.questionsSimples) {
      if (q.reponduParUtilisateur1 === undefined) {
        q.reponduParUtilisateur1 = false;
        modified = true;
      }
      if (q.reponduParUtilisateur2 === undefined) {
        q.reponduParUtilisateur2 = false;
        modified = true;
      }
    }
    if (modified) {
      await partie.save();
      console.log(`[Simples] Partie ${partie._id} corrigée`);
      totalSimples++;
    }
  }

  // Correction questions à correction
  const partiesCorrection = await Jeu.find({ 'questions.0': { $exists: true } });
  let totalCorrection = 0;
  for (const partie of partiesCorrection) {
    let modified = false;
    for (const q of partie.questions) {
      if (q.reponduParSujet === undefined) {
        q.reponduParSujet = false;
        modified = true;
      }
      if (q.reponduParDevineur === undefined) {
        q.reponduParDevineur = false;
        modified = true;
      }
    }
    if (modified) {
      await partie.save();
      console.log(`[Correction] Partie ${partie._id} corrigée`);
      totalCorrection++;
    }
  }

  console.log(`Correction terminée. ${totalSimples} parties simples modifiées, ${totalCorrection} parties à correction modifiées.`);
  process.exit(0);
}

// Correction des réponses pour pointer vers le bon ObjectId de question
const OLD_QUESTION_ID = '6855e8ec6abec6e75ed8cad6';
const NEW_QUESTION_ID = '6855e8ec6abec6e75ed8c914';

async function corrigerReponsesQuestion() {
  await mongoose.connect('mongodb://localhost:27017/nous_deux'); // adapte l'URL si besoin
  const res = await Reponse.updateMany(
    { question: OLD_QUESTION_ID },
    { $set: { question: NEW_QUESTION_ID } }
  );
  console.log(`Réponses corrigées :`, res);
  await mongoose.disconnect();
}

if (require.main === module) {
  corrigerReponsesQuestion().catch(console.error);
}

fixAllQuestions(); 