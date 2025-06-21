# Fonctionnalités PWA - Nous Deux

## 🚀 Installation PWA

L'application "Nous Deux" est maintenant une Progressive Web App (PWA) qui peut être installée sur votre appareil.

### Fonctionnalités PWA

#### 📱 Installation
- **Installation automatique** : L'application propose automatiquement l'installation sur les appareils compatibles
- **Icônes personnalisées** : Icônes adaptées pour tous les appareils (Android, iOS, Desktop)
- **Nom personnalisé** : "Nous Deux" apparaît comme nom de l'application

#### 🔄 Mises à jour automatiques
- **Détection des mises à jour** : L'application détecte automatiquement les nouvelles versions
- **Installation en arrière-plan** : Les mises à jour se téléchargent automatiquement
- **Notification de mise à jour** : L'utilisateur est notifié quand une mise à jour est prête

#### 📶 Mode hors ligne
- **Cache intelligent** : Les ressources importantes sont mises en cache
- **Page de fallback** : Page spéciale affichée quand l'utilisateur est hors ligne
- **Indicateur de connexion** : Notification visuelle du statut de connexion

#### 🎨 Interface utilisateur
- **Design adaptatif** : Interface optimisée pour mobile et desktop
- **Thème cohérent** : Couleurs et design cohérents avec l'identité visuelle
- **Animations fluides** : Transitions et animations optimisées

### Comment installer

#### Sur Android (Chrome)
1. Ouvrez l'application dans Chrome
2. Appuyez sur le menu (3 points) en haut à droite
3. Sélectionnez "Ajouter à l'écran d'accueil"
4. Confirmez l'installation

#### Sur iOS (Safari)
1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton de partage (carré avec flèche)
3. Sélectionnez "Sur l'écran d'accueil"
4. Appuyez sur "Ajouter"

#### Sur Desktop (Chrome/Edge)
1. Ouvrez l'application dans le navigateur
2. Cliquez sur l'icône d'installation dans la barre d'adresse
3. Confirmez l'installation

### Avantages de l'installation PWA

- **Accès rapide** : L'application s'ouvre directement depuis l'écran d'accueil
- **Performance** : Chargement plus rapide grâce au cache
- **Économie de données** : Moins de téléchargements grâce au cache
- **Expérience native** : Se comporte comme une application native
- **Mises à jour automatiques** : Toujours la dernière version

### Configuration technique

#### Service Worker
- **Cache intelligent** : Stratégies de cache optimisées pour chaque type de ressource
- **Mise à jour en arrière-plan** : Téléchargement automatique des nouvelles versions
- **Gestion hors ligne** : Fallback pour les requêtes réseau

#### Manifest
- **Métadonnées complètes** : Nom, description, icônes, couleurs
- **Comportement natif** : Affichage en mode standalone
- **Orientation** : Optimisé pour portrait

#### Icônes
- **Multiples tailles** : 192x192, 512x512, 180x180
- **Format SVG** : Icônes vectorielles pour tous les écrans
- **Maskable** : Compatible avec les formes d'icônes Android

### Développement

Pour tester les fonctionnalités PWA en développement :

```bash
npm run dev
```

Pour construire la version PWA :

```bash
npm run build:pwa
```

### Compatibilité

- ✅ Chrome (Android/Desktop)
- ✅ Safari (iOS)
- ✅ Edge (Windows)
- ✅ Firefox (Desktop/Mobile)
- ✅ Samsung Internet

### Support

Pour toute question concernant les fonctionnalités PWA, consultez la documentation ou contactez l'équipe de développement. 