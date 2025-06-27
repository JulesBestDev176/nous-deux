const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Utilisateur = require('./models/Utilisateur');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application
const app = express();
const httpServer = createServer(app);

// Autorise toutes les origines et tous les ports (DANGEREUX en prod, à restreindre ensuite)
app.use(cors({
  origin: true,
  credentials: true
}));

// Configuration Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST']
  }
});

// Middlewares globaux
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Dossier public pour les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fonction d'initialisation automatique des utilisateurs
const initUtilisateursAuto = async () => {
  try {
    const utilisateursExistants = await Utilisateur.find();
    
    if (utilisateursExistants.length === 0) {
      // Créer les utilisateurs SANS hasher manuellement (le modèle le fait automatiquement)
      const souleymane = new Utilisateur({
        nom: 'Souleymane Fall',
        code: '16092001', // Code brut, sera hashé par le modèle
        codePartenaire: '15062005'
      });

      const hadiyatou = new Utilisateur({
        nom: 'Hadiyatou Diallo',
        code: '15062005', // Code brut, sera hashé par le modèle
        codePartenaire: '16092001'
      });

      // Sauvegarder
      await souleymane.save();
      await hadiyatou.save();
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation automatique:', error);
  }
};

// Connexion MongoDB + Initialisation auto des utilisateurs
const connectDB = async () => {
  try {
    // Connexion sans les options dépréciées
    await mongoose.connect(process.env.MONGODB_URI);

    // Initialiser automatiquement les utilisateurs
    await initUtilisateursAuto();
    
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err.message);
    process.exit(1);
  }
};
connectDB();

// Configuration Socket.io
io.on('connection', (socket) => {
  socket.on('disconnect', () => {
  });
});

// Routes principales
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/gallerie', require('./routes/gallerie'));
app.use('/api/histoire', require('./routes/histoire'));
app.use('/api/user', require('./routes/user'));
app.use('/api/rappel', require('./routes/rappel'));
app.use('/api/calendrier', require('./routes/calendrier'));
app.use('/api/jeu', require('./routes/jeu'));
app.use('/api/message', require('./routes/message'));
app.use('/api/objectif', require('./routes/objectif'));
app.use('/api/profil', require('./routes/profil'));
app.use('/api/statistique', require('./routes/statistique'));
app.use('/api/voyage', require('./routes/voyage'));
app.use('/api/chatbot', require('./routes/chatbot'));

// Gestion 404
app.use((req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Gestion centralisée des erreurs
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});

module.exports = app;