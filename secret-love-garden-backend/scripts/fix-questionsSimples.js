const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Jeu = require('../models/Jeu');

async function fixQuestionsSimples() {
  await mongoose.connect(process.env.MONGODB_URI);

  const parties = await Jeu.find({ 'questionsSimples.0': { $exists: true } });
  let total = 0;
  for (const partie of parties) {
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
      console.log(`Partie ${partie._id} corrigée`);
      total++;
    }
  }
  console.log(`Correction terminée. ${total} parties modifiées.`);
  process.exit(0);
}

fixQuestionsSimples(); 