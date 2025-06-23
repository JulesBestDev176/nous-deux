import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Retirer '/api' ici

const getQuestionDuJour = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/questions/du-jour`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const soumettreReponse = async (reponse) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/questions/repondre`, reponse, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const ajouterQuestion = async (question) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/questions/ajouter`, question, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getReponseUtilisateur = async (questionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/questions/${questionId}/reponse`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getReponsesUtilisateur = async (utilisateurId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/questions/utilisateur/${utilisateurId}/reponses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getQuestionsPersonnalisees = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/questions/personnalisees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getReponsesPartenaire = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/questions/reponses-partenaire`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses du partenaire:', error);
    throw error.response.data;
  }
};

// Nouvelle méthode pour récupérer les questions avec les réponses du couple
const getQuestionsAvecReponsesCouple = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/questions/couple-responses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses du couple:', error);
    throw error.response?.data || error;
  }
};

const supprimerQuestion = async (questionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/api/questions/${questionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  getQuestionDuJour,
  soumettreReponse,
  ajouterQuestion,
  getReponseUtilisateur,
  getReponsesUtilisateur,
  getQuestionsPersonnalisees,
  getReponsesPartenaire,
  getQuestionsAvecReponsesCouple,
  supprimerQuestion
};