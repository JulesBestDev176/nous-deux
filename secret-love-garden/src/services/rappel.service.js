import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const creerRappel = async (rappelData) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    // Ajouter les données textuelles
    formData.append('titre', rappelData.titre);
    formData.append('description', rappelData.description || '');
    formData.append('contenu', rappelData.contenu);
    formData.append('dateRappel', rappelData.dateRappel);
    formData.append('priorite', rappelData.priorite || 'normale');
    formData.append('type', rappelData.type || 'texte');
    
    // Ajouter les images si présentes
    if (rappelData.images && rappelData.images.length > 0) {
      rappelData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }
    
    const response = await axios.post(`${API_URL}/api/rappel/creer`, formData, {
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

const getRappels = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/rappel`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const modifierStatutRappel = async (rappelId, statut) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/rappel/${rappelId}/statut`, 
      { statut },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const supprimerRappel = async (rappelId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/api/rappel/${rappelId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  creerRappel,
  getRappels,
  modifierStatutRappel,
  supprimerRappel
}; 