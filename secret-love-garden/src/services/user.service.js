import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Retirer '/api' ici

const modifierCode = async (ancienCode, nouveauCode) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/user/code`, 
      { ancienCode, nouveauCode }, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getProfil = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/user/profil`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getPartenaire = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/user/partenaire`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  modifierCode,
  getProfil,
  getPartenaire
};