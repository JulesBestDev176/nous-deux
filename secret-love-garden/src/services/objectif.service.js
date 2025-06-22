import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const creerObjectif = async (objectifData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/objectif/creer`, objectifData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getObjectifs = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/objectif`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const modifierProgression = async (objectifId, progression) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/objectif/${objectifId}/progression`, 
      { progression },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const modifierStatutObjectif = async (objectifId, statut) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/objectif/${objectifId}/statut`, 
      { statut },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const supprimerObjectif = async (objectifId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/api/objectif/${objectifId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  creerObjectif,
  getObjectifs,
  modifierProgression,
  modifierStatutObjectif,
  supprimerObjectif
};
