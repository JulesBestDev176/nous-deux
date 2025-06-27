const { ChatMistralAI } = require('@langchain/mistralai');
const Utilisateur = require('../models/Utilisateur');
const ProfilCouple = require('../models/ProfilCouple');
const Statistique = require('../models/Statistique');
const Reponse = require('../models/Reponse');
const Objectif = require('../models/Objectif');
const Evenement = require('../models/Evenement');
const Jeu = require('../models/Jeu');

class ChatbotService {
  constructor() {
    this.llm = new ChatMistralAI({
      model: process.env.CHATBOT_MODEL || 'mistral-tiny',
      temperature: parseFloat(process.env.CHATBOT_TEMPERATURE) || 0.7,
      apiKey: process.env.MISTRAL_API_KEY
    });
  }

  async getUserContext(userId) {
    try {
      const user = await Utilisateur.findById(userId).populate('partenaire');
      if (!user) throw new Error('Utilisateur non trouvé');
      const coupleProfile = await ProfilCouple.findOne({ $or: [ { utilisateur1: userId }, { utilisateur2: userId } ] }).populate(['utilisateur1', 'utilisateur2']);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - 30);
      const stats = await Statistique.find({ utilisateur: userId, date: { $gte: dateLimit } }).sort({ date: -1 });
      const recentResponses = await Reponse.find({ utilisateur: userId }).sort({ dateReponse: -1 }).limit(10);
      const objectives = await Objectif.find({ $or: [ { createur: userId }, { partenaire: userId } ], statut: { $in: ['en_attente', 'en_cours'] } });
      const events = await Evenement.find({ $or: [ { createur: userId }, { partenaire: userId } ] }).sort({ dateCreation: -1 }).limit(5);
      const recentGames = await Jeu.find({ createur: userId }).sort({ dateCreation: -1 }).limit(3);
      return { user, coupleProfile, stats, recentResponses, objectives, events, recentGames };
    } catch (error) {
      console.error('Erreur getUserContext:', error);
      throw error;
    }
  }

  analyzeCoupleHealth(context) {
    const analysis = { communicationScore: 0, activityScore: 0, engagementScore: 0, issues: [], strengths: [], recommendations: [] };
    const { recentResponses, stats, objectives, events, recentGames } = context;
    if (recentResponses.length > 5) {
      analysis.communicationScore = Math.min(10, recentResponses.length);
      analysis.strengths.push("Communication active");
    } else {
      analysis.communicationScore = recentResponses.length * 2;
      if (recentResponses.length < 3) analysis.issues.push("Communication insuffisante");
    }
    if (stats.length > 0) {
      const avgTimeTogether = stats.reduce((sum, s) => sum + (s.tempsEnsemble || 0), 0) / stats.length;
      analysis.activityScore = Math.min(10, avgTimeTogether / 60);
      if (avgTimeTogether < 120) analysis.issues.push("Temps passé ensemble insuffisant");
    }
    const engagementIndicators = objectives.length + events.length + recentGames.length;
    analysis.engagementScore = Math.min(10, engagementIndicators);
    if (engagementIndicators > 5) analysis.strengths.push("Couple très engagé dans la relation");
    else if (engagementIndicators < 2) analysis.issues.push("Manque d'engagement dans les activités communes");
    return analysis;
  }

  async generateAdvice(userMessage, context) {
    const coupleAnalysis = this.analyzeCoupleHealth(context);
    const { coupleProfile } = context;
    const systemPrompt = `Tu es un conseiller en relations amoureuses expert et empathique pour l'application "Nous Deux".
CONTEXTE DU COUPLE:
- Statut de la relation: ${coupleProfile?.statusRelation || 'Non défini'}
- Date de début de relation: ${coupleProfile?.dateDebutRelation || 'Non définie'}
- Points forts identifiés: ${coupleProfile?.pointsForts?.join(', ') || 'Aucun'}
- Points à améliorer: ${coupleProfile?.pointsAmeliorer?.join(', ') || 'Aucun'}
- Objectifs communs: ${coupleProfile?.objectifsCommuns?.join(', ') || 'Aucun'}
ANALYSE RÉCENTE:
- Score de communication: ${coupleAnalysis.communicationScore}/10
- Score d'activités: ${coupleAnalysis.activityScore}/10
- Score d'engagement: ${coupleAnalysis.engagementScore}/10
- Problèmes identifiés: ${coupleAnalysis.issues.join(', ')}
- Forces du couple: ${coupleAnalysis.strengths.join(', ')}
INSTRUCTIONS:
1. Réponds en français de manière chaleureuse et empathique
2. Utilise les données du couple pour personnaliser tes conseils
3. Propose des solutions concrètes et réalisables
4. Encourage les aspects positifs de la relation
5. Suggère des activités disponibles dans l'application si pertinent
6. Reste bienveillant même pour les sujets sensibles
7. Propose des questions de réflexion pour approfondir le sujet`;
    try {
      const messages = [ { role: 'system', content: systemPrompt }, { role: 'user', content: userMessage } ];
      const response = await this.llm.invoke(messages);
      return response.content;
    } catch (error) {
      console.error('Erreur generateAdvice:', error);
      return "Désolé, j'ai rencontré une erreur technique. Pouvez-vous reformuler votre question ?";
    }
  }

  suggestActivities(context) {
    const suggestions = [];
    const { coupleProfile } = context;
    const analysis = this.analyzeCoupleHealth(context);
    const preferences = coupleProfile?.preferences;
    if (preferences?.activitesFavorites?.length > 0) {
      suggestions.push(`Planifiez une session de ${preferences.activitesFavorites[0]} ensemble`);
    }
    if (analysis.issues.includes("Communication insuffisante")) {
      suggestions.push(
        "Répondez ensemble aux questions du jour",
        "Créez un nouveau défi de communication",
        "Planifiez un moment d'échange quotidien"
      );
    }
    if (analysis.issues.includes("Temps passé ensemble insuffisant")) {
      suggestions.push(
        "Organisez un voyage romantique",
        "Planifiez une soirée spéciale",
        "Créez un événement récurrent hebdomadaire"
      );
    }
    return suggestions.slice(0, 5);
  }

  async chat(userId, message) {
    try {
      const context = await this.getUserContext(userId);
      const advice = await this.generateAdvice(message, context);
      const suggestions = this.suggestActivities(context);
      const analysis = this.analyzeCoupleHealth(context);
      return { success: true, response: advice, suggestions, analysis };
    } catch (error) {
      console.error('Erreur chat:', error);
      return { success: false, response: "Je ne peux pas accéder à vos informations pour le moment. Veuillez réessayer plus tard.", error: error.message };
    }
  }
}

module.exports = new ChatbotService(); 