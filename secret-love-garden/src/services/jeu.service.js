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
    throw error.response.data;
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
    throw error.response.data;
  }
};

const soumettreReponseJeu = async (partieId, reponse) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/jeu/partie/${partieId}/reponse`, 
      { reponse },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
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
    throw error.response.data;
  }
};

const getQuizRelation = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/quiz-relation`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
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
    throw error.response.data;
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
    throw error.response.data;
  }
};

const getQuestionsPreferences = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/jeu/questions-preferences`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  getJeuxDisponibles,
  demarrerPartie,
  soumettreReponseJeu,
  getHistoriqueParties,
  getQuizRelation,
  getDeffisCouple,
  completerDefi,
  getQuestionsPreferences
};