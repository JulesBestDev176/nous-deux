#!/usr/bin/env node

/**
 * Script pour migrer les données JSON vers MongoDB Atlas
 * Usage: node scripts/migrate-jeux.js
 */

// Charger les variables d'environnement depuis le répertoire parent
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { migrerDonnees } = require('./migration-data');

async function main() {
  try {
    console.log('🚀 Début de la migration des jeux vers MongoDB Atlas...\n');

    // Connexion à MongoDB Atlas
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI non trouvé dans le fichier .env');
    }
    
    console.log(`📡 Connexion à MongoDB Atlas...`);
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connexion MongoDB Atlas établie\n');

    // Exécuter la migration
    await migrerDonnees();

    console.log('\n🎉 Migration terminée avec succès !');
    console.log('\n📋 Actions suivantes :');
    console.log('1. Vérifiez vos collections MongoDB Atlas');
    console.log('2. Testez l\'API avec les nouveaux endpoints');
    console.log('3. Supprimez le fichier jeux.json s\'il existe');
    console.log('4. Redémarrez votre serveur backend\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration :', error.message);
    if (error.message.includes('MONGODB_URI')) {
      console.error('\n💡 Vérifiez que votre fichier .env contient MONGODB_URI');
      console.error('💡 Exemple: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname');
    }
    process.exit(1);
  } finally {
    // Fermer la connexion MongoDB
    await mongoose.connection.close();
    console.log('📡 Connexion MongoDB fermée');
  }
}

// Vérifier que le script est exécuté directement
if (require.main === module) {
  main();
}

module.exports = main;