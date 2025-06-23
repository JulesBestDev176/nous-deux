const mongoose = require('mongoose');
const Reponse = require('../models/Reponse');

const OLD_QUESTION_ID = '6855e8ec6abec6e75ed8cad6';
const NEW_QUESTION_ID = '6855e8ec6abec6e75ed8c914';

async function corrigerReponsesQuestion() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI non défini dans les variables d\'environnement.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const res = await Reponse.updateMany(
    { question: OLD_QUESTION_ID },
    { $set: { question: NEW_QUESTION_ID } }
  );
  console.log(`Réponses corrigées :`, res);
  await mongoose.disconnect();
}

if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  corrigerReponsesQuestion().catch(console.error);
} 