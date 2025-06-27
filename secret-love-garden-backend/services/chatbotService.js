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
      // Récupérer l'utilisateur
      const user = await Utilisateur.findById(userId);
      if (!user) throw new Error('Utilisateur non trouvé');
      
      // Récupérer le partenaire via codePartenaire
      let partner = null;
      if (user.codePartenaire) {
        partner = await Utilisateur.findOne({ code: user.codePartenaire });
      }
      
      // Récupérer le profil du couple
      const coupleProfile = await ProfilCouple.findOne({ 
        $or: [ 
          { utilisateur1: userId }, 
          { utilisateur2: userId } 
        ] 
      }).populate(['utilisateur1', 'utilisateur2']);
      
      // Dernières 30 jours de stats
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - 30);
      
      const stats = await Statistique.find({ 
        utilisateur: userId, 
        date: { $gte: dateLimit } 
      }).sort({ date: -1 });
      
      // Dernières réponses
      const recentResponses = await Reponse.find({ 
        utilisateur: userId 
      }).sort({ dateReponse: -1 }).limit(10);
      
      // Objectifs en cours
      const objectives = await Objectif.find({ 
        $or: [ { createur: userId }, { partenaire: userId } ], 
        statut: { $in: ['en_attente', 'en_cours'] } 
      });
      
      // Événements récents
      const events = await Evenement.find({ 
        $or: [ { createur: userId }, { partenaire: userId } ] 
      }).sort({ dateCreation: -1 }).limit(5);
      
      // Jeux récents
      const recentGames = await Jeu.find({ 
        createur: userId 
      }).sort({ dateCreation: -1 }).limit(3);
      
      return { 
        user, 
        partner, 
        coupleProfile, 
        stats, 
        recentResponses, 
        objectives, 
        events, 
        recentGames 
      };
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
    
    // Score de communication basé sur les réponses
    if (recentResponses.length > 5) {
      analysis.communicationScore = Math.min(10, recentResponses.length);
      analysis.strengths.push("Communication active");
    } else {
      analysis.communicationScore = recentResponses.length * 2;
      if (recentResponses.length < 3) {
        analysis.issues.push("Communication insuffisante");
      }
    }
    
    // Score d'activité basé sur le temps ensemble
    if (stats.length > 0) {
      const avgTimeTogether = stats.reduce((sum, s) => sum + (s.tempsEnsemble || 0), 0) / stats.length;
      analysis.activityScore = Math.min(10, avgTimeTogether / 60); // convertir en heures
      if (avgTimeTogether < 120) { // moins de 2h par jour en moyenne
        analysis.issues.push("Temps passé ensemble insuffisant");
      } else {
        analysis.strengths.push("Bon temps de qualité ensemble");
      }
    }
    
    // Score d'engagement basé sur objectifs, événements, jeux
    const engagementIndicators = objectives.length + events.length + recentGames.length;
    analysis.engagementScore = Math.min(10, engagementIndicators);
    
    if (engagementIndicators > 5) {
      analysis.strengths.push("Couple très engagé dans la relation");
    } else if (engagementIndicators < 2) {
      analysis.issues.push("Manque d'engagement dans les activités communes");
    }
    
    return analysis;
  }

  buildContextualPrompt(context) {
    const { user, partner, coupleProfile } = context;
    const coupleAnalysis = this.analyzeCoupleHealth(context);
    
    // Calculer la durée de la relation si possible
    let relationDuration = 'Non définie';
    if (coupleProfile?.dateDebutRelation) {
      const start = new Date(coupleProfile.dateDebutRelation);
      const now = new Date();
      const months = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30));
      relationDuration = `${months} mois`;
    }
    
    return `Tu es l'assistant IA de l'application "Nous Deux" qui aide les couples. Tu connais bien cet utilisateur et son couple.

PROFIL UTILISATEUR:
- Prénom: ${user.nom || user.prenom || 'Non défini'}
- Code utilisateur: ${user.code}
- Code partenaire recherché: ${user.codePartenaire || 'Non défini'}
- Partenaire identifié: ${partner ? partner.nom || partner.prenom : 'Aucun partenaire trouvé'}
- Date création compte: ${user.dateCreation ? new Date(user.dateCreation).toLocaleDateString() : 'Non définie'}

DONNÉES DU COUPLE:
- Statut relation: ${coupleProfile?.statusRelation || 'Non défini'}
- Ensemble depuis: ${relationDuration}
- Date rencontre: ${coupleProfile?.dateRencontre ? new Date(coupleProfile.dateRencontre).toLocaleDateString() : 'Non définie'}
- Points forts identifiés: ${coupleProfile?.pointsForts?.join(', ') || 'Aucun encore'}
- Points à améliorer: ${coupleProfile?.pointsAmeliorer?.join(', ') || 'Aucun identifié'}
- Objectifs communs: ${coupleProfile?.objectifsCommuns?.join(', ') || 'Aucun défini'}

ANALYSE COMPORTEMENTALE RÉCENTE:
- Score communication: ${coupleAnalysis.communicationScore}/10
- Score activités: ${coupleAnalysis.activityScore}/10  
- Score engagement: ${coupleAnalysis.engagementScore}/10
- Problèmes détectés: ${coupleAnalysis.issues.join(', ') || 'Aucun'}
- Forces actuelles: ${coupleAnalysis.strengths.join(', ') || 'Aucune'}

INSTRUCTIONS COMPORTEMENTALES:
- Réponds de façon naturelle comme un assistant qui CONNAÎT déjà cet utilisateur
- Adapte ton style selon le type de question :
  * Salutation simple → "Salut [prénom] ! Ça va ?"
  * Question factuelle → Réponse directe avec les données que tu as
  * Demande conseil → Conseil personnalisé basé sur leur situation
  * Question sur partenaire → Utilise les données réelles du partenaire
- Utilise les vraies données de leur relation, pas des généralités
- Sois concis pour les questions simples, détaillé pour les conseils
- Ne répète pas systématiquement tous les scores dans chaque réponse
- Montre que tu connais leur historique et situation`;
  }

  async generateResponse(userMessage, context) {
    const systemPrompt = this.buildContextualPrompt(context);
    
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];
      
      const response = await this.llm.invoke(messages);
      return response.content;
    } catch (error) {
      console.error('Erreur generateResponse:', error);
      return "Désolé, j'ai un petit problème technique. Tu peux réessayer ?";
    }
  }

  suggestActivities(context) {
    const suggestions = [];
    const { coupleProfile } = context;
    const analysis = this.analyzeCoupleHealth(context);
    
    // Suggestions basées sur les préférences existantes
    if (coupleProfile?.preferences?.activitesFavorites?.length > 0) {
      suggestions.push(`Refaire du ${coupleProfile.preferences.activitesFavorites[0]} ensemble`);
    }
    
    // Suggestions basées sur l'analyse comportementale
    if (analysis.issues.includes("Communication insuffisante")) {
      suggestions.push(
        "Répondez aux questions du jour ensemble",
        "Créez un moment d'échange quotidien"
      );
    }
    
    if (analysis.issues.includes("Temps passé ensemble insuffisant")) {
      suggestions.push(
        "Planifiez une soirée spéciale",
        "Organisez un week-end rien qu'à vous"
      );
    }
    
    // Suggestions générales si tout va bien
    if (analysis.issues.length === 0) {
      suggestions.push(
        "Explorez les nouveaux jeux de couple",
        "Créez un nouveau souvenir ensemble",
        "Planifiez votre prochaine aventure"
      );
    }
    
    return suggestions.slice(0, 4);
  }

  async chat(userId, message) {
    try {
      const context = await this.getUserContext(userId);
      
      // Debug log pour vérifier les données
      console.log('Context user:', context.user?.nom, context.user?.code);
      console.log('Context partner:', context.partner?.nom);
      console.log('Couple profile:', context.coupleProfile?.statusRelation);
      
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
      console.error('Erreur chat complète:', error);
      return { 
        success: false, 
        response: "Je ne peux pas accéder à vos informations pour le moment. Vérifions votre connexion.", 
        error: error.message 
      };
    }
  }
}

module.exports = new ChatbotService();