import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getProfilCouple = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/profil/couple`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const passerTestCompatibilite = async (reponses) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/profil/test-compatibilite`, 
      { reponses },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getResultatsTests = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/profil/resultats-tests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const passerTestLoveLanguages = async (reponses) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/profil/love-languages`, 
      { reponses },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const passerTestPersonnalite = async (reponses) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/profil/personnalite`, 
      { reponses },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getConseilsPersonnalises = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/profil/conseils`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const mettreAJourPreferences = async (preferences) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/profil/preferences`, 
      preferences,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  getProfilCouple,
  passerTestCompatibilite,
  getResultatsTests,
  passerTestLoveLanguages,
  passerTestPersonnalite,
  getConseilsPersonnalises,
  mettreAJourPreferences
};
