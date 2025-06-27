const { ChatMistralAI } = require('@langchain/mistralai');
require('dotenv').config();

const llm = new ChatMistralAI({
  model: process.env.CHATBOT_MODEL || 'mistral-tiny',
  temperature: parseFloat(process.env.CHATBOT_TEMPERATURE) || 0.7,
  apiKey: process.env.MISTRAL_API_KEY
});

(async () => {
  try {
    const res = await llm.invoke([
      { role: 'system', content: 'Tu es un assistant bienveillant.' },
      { role: 'user', content: 'Donne-moi un conseil pour un couple qui veut mieux communiquer.' }
    ]);
    console.log('Réponse du chatbot :\n', res.content);
  } catch (e) {
    console.error('Erreur lors de l’appel à MistralAI :', e);
  }
})(); 