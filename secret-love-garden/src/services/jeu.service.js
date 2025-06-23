import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getJeuxDisponibles = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/disponibles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const demarrerPartie = async (typeJeu) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/jeu/demarrer`, 
      { typeJeu },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const getPartie = async (partieId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/partie/${partieId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const soumettreReponse = async (partieId, indexQuestion, reponse) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/jeu/partie/${partieId}/reponse`, 
      { 
        indexQuestion,
        reponse 
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const corrigerReponse = async (partieId, indexQuestion, estCorrect) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/jeu/partie/${partieId}/corriger`, 
      { 
        indexQuestion,
        estCorrect 
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const getHistoriqueParties = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/historique`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const getQuizRelation = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/questions/quiz-relation`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const getDeffisCouple = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/defis`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const completerDefi = async (defiId, preuveData) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    formData.append('commentaire', preuveData.commentaire || '');
    
    if (preuveData.images && preuveData.images.length > 0) {
      preuveData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }
    
    const response = await axios.post(`${API_URL}/api/jeu/defi/${defiId}/completer`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const getQuestionsPreferences = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/questions/preferences`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const getQuestionsJeu = async (typeJeu) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/questions/${typeJeu}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const terminerPartie = async (partieId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/api/jeu/partie/${partieId}/terminer`, 
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const abandonnerPartie = async (partieId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/api/jeu/partie/${partieId}/abandonner`, 
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

const getStatistiquesJeux = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/statistiques`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erreur réseau' };
  }
};

export default {
  getJeuxDisponibles,
  demarrerPartie,
  getPartie,
  soumettreReponse,
  corrigerReponse,
  getHistoriqueParties,
  getQuizRelation,
  getDeffisCouple,
  completerDefi,
  getQuestionsPreferences,
  getQuestionsJeu,
  terminerPartie,
  abandonnerPartie,
  getStatistiquesJeux
};