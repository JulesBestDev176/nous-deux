import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const creerEvenement = async (evenementData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/calendrier/evenement`, evenementData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getEvenements = async (mois, annee) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/calendrier/evenements?mois=${mois}&annee=${annee}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getEvenementsAnniversaires = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/calendrier/anniversaires`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const modifierEvenement = async (evenementId, evenementData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/calendrier/evenement/${evenementId}`, evenementData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const supprimerEvenement = async (evenementId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/api/calendrier/evenement/${evenementId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getProchainEvenement = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/calendrier/prochain`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  creerEvenement,
  getEvenements,
  getEvenementsAnniversaires,
  modifierEvenement,
  supprimerEvenement,
  getProchainEvenement
};