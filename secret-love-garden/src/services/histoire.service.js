import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Retirer '/api' ici

const genererHistoire = async () => {
  const url = `${API_URL}/api/histoire/generer`;
  console.log('[API] Appel à :', url);
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('[API] Erreur lors de l’appel à', url, error);
    throw error.response.data;
  }
};

const getHistorique = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/histoire`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  genererHistoire,
  getHistorique
};