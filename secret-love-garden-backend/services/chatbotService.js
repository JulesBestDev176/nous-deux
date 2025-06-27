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
      model: process.env.CHATBOT_MODEL || 'mistral-large-latest',
      temperature: parseFloat(process.env.CHATBOT_TEMPERATURE) || 0.7,
      apiKey: process.env.MISTRAL_API_KEY
    });
  }

  async getUserContext(userId) {
    try {
      const user = await Utilisateur.findById(userId).populate('partenaire');
      if (!user) throw new Error('Utilisateur non trouvé');
      
      const coupleProfile = await ProfilCouple.findOne({ 
        $or: [ { utilisateur1: userId }, { utilisateur2: userId } ] 
      }).populate(['utilisateur1', 'utilisateur2']);
      
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - 30);
      
      const stats = await Statistique.find({ 
        utilisateur: userId, 
        date: { $gte: dateLimit } 
      }).sort({ date: -1 });
      
      const recentResponses = await Reponse.find({ 
        utilisateur: userId 
      }).sort({ dateReponse: -1 }).limit(10);
      
      const objectives = await Objectif.find({ 
        $or: [ { createur: userId }, { partenaire: userId } ], 
        statut: { $in: ['en_attente', 'en_cours'] } 
      });
      
      const events = await Evenement.find({ 
        $or: [ { createur: userId }, { partenaire: userId } ] 
      }).sort({ dateCreation: -1 }).limit(5);
      
      const recentGames = await Jeu.find({ 
        createur: userId 
      }).sort({ dateCreation: -1 }).limit(3);
      
      return { user, coupleProfile, stats, recentResponses, objectives, events, recentGames };
    } catch (error) {
      console.error('Erreur getUserContext:', error);
      throw error;
    }
  }

  analyzeCoupleHealth(context) {
    const analysis = { 
      communicationScore: 0, 
      activityScore: 0, 
      engagementScore: 0, 
      issues: [], 
      strengths: [], 
      recommendations: [] 
    };
    
    const { recentResponses, stats, objectives, events, recentGames } = context;
    
    // Score de communication
    if (recentResponses.length > 5) {
      analysis.communicationScore = Math.min(10, recentResponses.length);
      analysis.strengths.push("Communication active");
    } else {
      analysis.communicationScore = recentResponses.length * 2;
      if (recentResponses.length < 3) {
        analysis.issues.push("Communication insuffisante");
      }
    }
    
    // Score d'activité
    if (stats.length > 0) {
      const avgTimeTogether = stats.reduce((sum, s) => sum + (s.tempsEnsemble || 0), 0) / stats.length;
      analysis.activityScore = Math.min(10, avgTimeTogether / 60);
      if (avgTimeTogether < 120) {
        analysis.issues.push("Temps passé ensemble insuffisant");
      }
    }
    
    // Score d'engagement
    const engagementIndicators = objectives.length + events.length + recentGames.length;
    analysis.engagementScore = Math.min(10, engagementIndicators);
    
    if (engagementIndicators > 5) {
      analysis.strengths.push("Couple très engagé dans la relation");
    } else if (engagementIndicators < 2) {
      analysis.issues.push("Manque d'engagement dans les activités communes");
    }
    
    return analysis;
  }

  buildFlexiblePrompt(context) {
    const { user, coupleProfile } = context;
    const coupleAnalysis = this.analyzeCoupleHealth(context);
    
    return `Tu es l'assistant personnel de l'application "Nous Deux" qui aide les couples.

INFORMATIONS SUR L'UTILISATEUR:
- Prénom: ${user.prenom}
- Partenaire: ${user.partenaire?.prenom || 'Non défini'}
- Statut relation: ${coupleProfile?.statusRelation || 'Non défini'}
- Ensemble depuis: ${coupleProfile?.dateDebutRelation || 'Date non définie'}
- Points forts du couple: ${coupleProfile?.pointsForts?.join(', ') || 'Non définis'}
- Points à améliorer: ${coupleProfile?.pointsAmeliorer?.join(', ') || 'Non définis'}

ÉTAT ACTUEL DU COUPLE:
- Score communication: ${coupleAnalysis.communicationScore}/10
- Score activités: ${coupleAnalysis.activityScore}/10  
- Score engagement: ${coupleAnalysis.engagementScore}/10
- Problèmes récents: ${coupleAnalysis.issues.join(', ') || 'Aucun'}
- Forces actuelles: ${coupleAnalysis.strengths.join(', ') || 'Aucune'}

INSTRUCTIONS:
- Réponds naturellement comme un ami bienveillant et expert en relations
- Adapte automatiquement le type de réponse selon la question :
  * Questions simples/salutations → réponse courte et amicale
  * Demandes d'info → réponse factuelle avec les données disponibles  
  * Problèmes relationnels → conseils personnalisés et empathiques
  * Conversation générale → discussion naturelle et engageante
- Utilise les informations du couple pour personnaliser tes réponses quand c'est pertinent
- Sois chaleureux et authentique, pas robotique
- Propose des activités de l'app seulement si ça fait sens dans le contexte
- Varie tes réponses, ne sois jamais prévisible ou répétitif`;
  }

  async generateResponse(userMessage, context) {
    const systemPrompt = this.buildFlexiblePrompt(context);
    
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];
      
      const response = await this.llm.invoke(messages);
      return response.content;
    } catch (error) {
      console.error('Erreur generateResponse:', error);
      return "Désolé, j'ai un petit souci technique. Tu peux réessayer ?";
    }
  }

  suggestActivities(context) {
    const suggestions = [];
    const { coupleProfile } = context;
    const analysis = this.analyzeCoupleHealth(context);
    const preferences = coupleProfile?.preferences;
    
    // Suggestions basées sur les préférences
    if (preferences?.activitesFavorites?.length > 0) {
      suggestions.push(`Planifiez une session de ${preferences.activitesFavorites[0]} ensemble`);
    }
    
    // Suggestions basées sur l'analyse
    if (analysis.issues.includes("Communication insuffisante")) {
      suggestions.push(
        "Répondez ensemble aux questions du jour",
        "Créez un nouveau défi de communication"
      );
    }
    
    if (analysis.issues.includes("Temps passé ensemble insuffisant")) {
      suggestions.push(
        "Organisez une soirée spéciale",
        "Planifiez un moment rien qu'à vous deux"
      );
    }
    
    // Suggestions générales si pas de problèmes spécifiques
    if (analysis.issues.length === 0) {
      suggestions.push(
        "Découvrez les nouveaux jeux du couple",
        "Créez un souvenir ensemble"
      );
    }
    
    return suggestions.slice(0, 4);
  }

  async chat(userId, message) {
    try {
      const context = await this.getUserContext(userId);
      
      // Mistral gère tout, mais avec un prompt intelligent
      const response = await this.generateResponse(message, context);
      const suggestions = this.suggestActivities(context);
      const analysis = this.analyzeCoupleHealth(context);
      
      return { 
        success: true, 
        response: response, 
        suggestions, 
        analysis
      };
    } catch (error) {
      console.error('Erreur chat:', error);
      return { 
        success: false, 
        response: "Je ne peux pas accéder à vos informations pour le moment. Réessayons dans un instant ?", 
        error: error.message 
      };
    }
  }
}

module.exports = new ChatbotService();