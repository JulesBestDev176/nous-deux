import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getStatistiquesGenerales = async () => {
  const url = `${API_URL}/api/statistique/generales`;
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

const getStatistiquesMessages = async (periode = '30j') => {
  const url = `${API_URL}/api/statistique/messages?periode=${periode}`;
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

const getStatistiquesActivites = async (periode = '30j') => {
  const url = `${API_URL}/api/statistique/activites?periode=${periode}`;
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

const getStatistiquesHumeur = async (periode = '30j') => {
  const url = `${API_URL}/api/statistique/humeur?periode=${periode}`;
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

const ajouterHumeur = async (humeurData) => {
  const url = `${API_URL}/api/statistique/humeur`;
  console.log('[API] Appel à :', url);
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(url, humeurData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('[API] Erreur lors de l’appel à', url, error);
    throw error.response.data;
  }
};

const getTempsEnsemble = async () => {
  const url = `${API_URL}/api/statistique/temps-ensemble`;
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

export default {
  getStatistiquesGenerales,
  getStatistiquesMessages,
  getStatistiquesActivites,
  getStatistiquesHumeur,
  ajouterHumeur,
  getTempsEnsemble
};