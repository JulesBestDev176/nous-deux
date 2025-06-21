const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');
const questions = require('../data/questions.json');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  migrerQuestions();
})
.catch(err => console.error('Erreur de connexion:', err));

async function migrerQuestions() {
  try {
    const count = await Question.countDocuments();
    if (count > 0) {
      process.exit(0);
    }

    const questionsSysteme = questions.map(q => ({
      texte: q.texte,
      categorie: 'systeme'
    }));

    await Question.insertMany(questionsSysteme);
    process.exit(0);
  } catch (erreur) {
    console.error('Erreur de migration:', erreur);
    process.exit(1);
  }
}