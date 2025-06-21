import axios from 'axios';

// Ne PAS doubler le chemin "auth" si déjà présent dans VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Intercepteur pour gérer automatiquement les erreurs d'authentification
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expiré ou invalide - seulement nettoyer si c'est une vraie erreur d'auth
      console.log("Token expiré ou invalide, nettoyage de la session");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Ne pas recharger la page automatiquement
    }
    return Promise.reject(error);
  }
);

// Intercepteur pour ajouter automatiquement le token aux requêtes
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const initialisation = async () => {
  try {
    const url = `${BASE_URL}/api/auth/init`;
    const response = await axios.post(url);
    return response.data;
  } catch (error) {
    console.error('Erreur initialisation:', error.response?.data || error.message);
    throw error?.response?.data || { message: 'Erreur inconnue' };
  }
};

const connexion = async (code) => {
  try {
    const url = `${BASE_URL}/api/auth/connexion`;
    
    const response = await axios.post(url, { code });
    
    // Sauvegarder le token et les informations utilisateur localement
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log("Token sauvegardé");
    }
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log("Utilisateur sauvegardé:", response.data.user.nom);
    }
    
    return response.data;
  } catch (error) {
    console.error('Erreur connexion:', error.response?.data || error.message);
    throw error?.response?.data || { message: 'Erreur inconnue' };
  }
};

const deconnexion = async () => {
  try {
    const token = localStorage.getItem('token');
    const url = `${BASE_URL}/api/auth/deconnexion`;
    
    const response = await axios.post(url, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Nettoyer le stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return response.data;
  } catch (error) {
    console.error('Erreur déconnexion:', error.response?.data || error.message);
    // Nettoyer quand même le stockage local même en cas d'erreur
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error?.response?.data || { message: 'Erreur inconnue' };
  }
};

const verifierSession = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("Aucun token trouvé");
      return { success: false, user: null };
    }

    const url = `${BASE_URL}/api/auth/verifier-session`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Mettre à jour les informations utilisateur si nécessaire
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log("Session vérifiée avec succès:", response.data.user.nom);
    }
    
    return response.data;
  } catch (error) {
    console.error('Erreur vérification session:', error.response?.data || error.message);
    
    // Ne pas nettoyer le localStorage si c'est juste un problème de réseau
    // Seulement nettoyer si c'est une erreur d'authentification (401)
    if (error.response && error.response.status === 401) {
      console.log("Session invalide, nettoyage du localStorage");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: false, user: null };
    }
    
    // Pour les autres erreurs (réseau, serveur), retourner l'utilisateur local
    const localUser = getCurrentUser();
    if (localUser) {
      console.log("Utilisation des données locales en cas d'erreur réseau");
      return { success: true, user: localUser };
    }
    
    return { success: false, user: null };
  }
};

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Erreur lecture utilisateur:', error);
    return null;
  }
};

export default {
  initialisation,
  connexion,
  deconnexion,
  verifierSession,
  getCurrentUser
};