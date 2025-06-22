import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getStatistiquesGenerales = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/statistique/generales`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getStatistiquesMessages = async (periode = '30j') => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/statistique/messages?periode=${periode}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getStatistiquesActivites = async (periode = '30j') => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/statistique/activites?periode=${periode}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getStatistiquesHumeur = async (periode = '30j') => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/statistique/humeur?periode=${periode}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const ajouterHumeur = async (humeurData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/statistique/humeur`, humeurData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getTempsEnsemble = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/statistique/temps-ensemble`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  getStatistiquesGenerales,
  getStatistiquesMessages,
  getStatistiquesActivites,
  getStatistiquesHumeur,
  ajouterHumeur,
  getTempsEnsemble
};