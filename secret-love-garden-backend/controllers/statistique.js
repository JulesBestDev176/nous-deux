// controllers/statistique.js
const Statistique = require('../models/Statistique');
const Message = require('../models/Message');
const Gallerie = require('../models/Gallerie');
const Reponse = require('../models/Reponse');
const Utilisateur = require('../models/Utilisateur');
const Evenement = require('../models/Evenement');

// Enregistrer une entrée de statistique
exports.enregistrerStatistique = async (req, res) => {
  try {
    const { humeur, activites, tempsEnsemble } = req.body;

    if (!humeur || !humeur.niveau) {
      return res.status(400).json({
        success: false,
        message: 'Le niveau d\'humeur est requis'
      });
    }

    const statistique = await Statistique.create({
      utilisateur: req.utilisateur.id,
      humeur,
      activites: activites || [],
      tempsEnsemble: tempsEnsemble || 0
    });

    res.status(201).json({
      success: true,
      data: statistique
    });

  } catch (error) {
    console.error('Erreur enregistrement statistique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la statistique'
    });
  }
};

// Obtenir les statistiques
exports.getStatistiques = async (req, res) => {
  try {
    const { periode, startDate, endDate } = req.query;
    let dateFilter = {};

    // Définir la période
    if (periode) {
      const now = new Date();
      switch (periode) {
        case '7jours':
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case '30jours':
          dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case '3mois':
          dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
      }
    } else if (startDate && endDate) {
      dateFilter = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }

    const filter = {
      utilisateur: req.utilisateur.id,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
    };

    const statistiques = await Statistique.find(filter)
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: statistiques.length,
      data: statistiques
    });

  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Obtenir un résumé des statistiques
exports.getResumeStatistiques = async (req, res) => {
  try {
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

    // Statistiques du mois en cours
    const statsUtilisateur = await Statistique.find({
      utilisateur: req.utilisateur.id,
      date: { $gte: debutMois }
    });

    // Compter les autres activités du mois
    const [messagesEnvoyes, photosPartagees, questionsRepondues] = await Promise.all([
      Message.countDocuments({
        expediteur: req.utilisateur.id,
        dateEnvoi: { $gte: debutMois }
      }),
      Gallerie.countDocuments({
        createur: req.utilisateur.id,
        dateCreation: { $gte: debutMois }
      }),
      Reponse.countDocuments({
        utilisateur: req.utilisateur.id,
        dateReponse: { $gte: debutMois }
      })
    ]);

    // Calculer les moyennes
    const humeurMoyenne = statsUtilisateur.length > 0 
      ? statsUtilisateur.reduce((sum, stat) => sum + stat.humeur.niveau, 0) / statsUtilisateur.length 
      : 0;

    const tempsEnsembleMoyen = statsUtilisateur.length > 0
      ? statsUtilisateur.reduce((sum, stat) => sum + stat.tempsEnsemble, 0) / statsUtilisateur.length
      : 0;

    const resume = {
      humeurMoyenne: Math.round(humeurMoyenne * 10) / 10,
      tempsEnsembleMoyen: Math.round(tempsEnsembleMoyen * 10) / 10,
      messagesEnvoyes,
      photosPartagees,
      questionsRepondues,
      joursActifs: statsUtilisateur.length
    };

    res.status(200).json({
      success: true,
      data: resume
    });

  } catch (error) {
    console.error('Erreur résumé statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul du résumé'
    });
  }
};

// Obtenir les tendances hebdomadaires
exports.getTendancesHebdomadaires = async (req, res) => {
  try {
    const maintenant = new Date();
    const debutSemaine = new Date(maintenant.getTime() - 7 * 24 * 60 * 60 * 1000);

    const tendances = await Statistique.aggregate([
      {
        $match: {
          utilisateur: require('mongoose').Types.ObjectId(req.utilisateur.id),
          date: { $gte: debutSemaine }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          humeurMoyenne: { $avg: "$humeur.niveau" },
          tempsEnsembleTotal: { $sum: "$tempsEnsemble" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: tendances
    });

  } catch (error) {
    console.error('Erreur tendances hebdomadaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des tendances'
    });
  }
};

// Placeholder pour les nouvelles fonctions
exports.getStatistiquesGenerales = async (req, res) => {
  try {
    const utilisateurConnecte = await Utilisateur.findById(req.utilisateur.id);
    if (!utilisateurConnecte || !utilisateurConnecte.partenaire) {
      return res.status(404).json({ success: false, message: 'Utilisateur ou partenaire non trouvé' });
    }
    const partenaireId = utilisateurConnecte.partenaire;
    const coupleIds = [utilisateurConnecte._id, partenaireId];

    const totalMessages = await Message.countDocuments({ expediteur: { $in: coupleIds } });
    const totalPhotos = await Gallerie.countDocuments({ createur: { $in: coupleIds } });
    const totalEvenements = await Evenement.countDocuments({ createur: { $in: coupleIds } });

    const prochainEvenement = await Evenement.findOne({
      createur: { $in: coupleIds },
      date: { $gte: new Date() }
    }).sort({ date: 'asc' });

    res.status(200).json({ 
      success: true, 
      data: {
        totalMessages,
        totalPhotos,
        totalEvenements,
        prochainEvenement: prochainEvenement ? { titre: prochainEvenement.titre, date: prochainEvenement.date } : null
      }
    });
  } catch (error) {
    console.error('Erreur getStatistiquesGenerales:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getStatistiquesMessages = async (req, res) => {
  // Renvoie un tableau vide pour les graphiques
  res.status(200).json({ success: true, data: [] });
};

exports.getStatistiquesActivites = async (req, res) => {
  // Renvoie un tableau vide pour les graphiques
  res.status(200).json({ success: true, data: [] });
};

exports.getStatistiquesHumeur = async (req, res) => {
  // Renvoie un tableau vide pour les graphiques
  res.status(200).json({ success: true, data: [] });
};

exports.ajouterHumeur = async (req, res) => {
  // Renvoie un objet vide pour l'instant
  res.status(201).json({ success: true, data: {} });
};

exports.getTempsEnsemble = async (req, res) => {
  // Renvoie un objet vide pour l'instant
  res.status(200).json({ success: true, data: {} });
};
