import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const creerVoyage = async (voyageData) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    // Ajouter les données textuelles
    formData.append('titre', voyageData.titre);
    formData.append('destination', voyageData.destination);
    formData.append('description', voyageData.description || '');
    formData.append('dateDebut', voyageData.dateDebut);
    formData.append('dateFin', voyageData.dateFin);
    formData.append('coordonnees', JSON.stringify(voyageData.coordonnees || {}));
    formData.append('statut', voyageData.statut || 'planifie');
    
    // Ajouter les images si présentes
    if (voyageData.images && voyageData.images.length > 0) {
      voyageData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }
    
    const response = await axios.post(`${API_URL}/api/voyage/creer`, formData, {
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

const getVoyages = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/voyage`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const ajouterSouvenir = async (voyageId, souvenirData) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    formData.append('titre', souvenirData.titre);
    formData.append('description', souvenirData.description || '');
    formData.append('date', souvenirData.date);
    formData.append('lieu', souvenirData.lieu || '');
    
    if (souvenirData.images && souvenirData.images.length > 0) {
      souvenirData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }
    
    const response = await axios.post(`${API_URL}/api/voyage/${voyageId}/souvenir`, formData, {
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

const modifierStatutVoyage = async (voyageId, statut) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/voyage/${voyageId}/statut`, 
      { statut },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const supprimerVoyage = async (voyageId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/api/voyage/${voyageId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getCarteVoyages = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/voyage/carte`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default {
  creerVoyage,
  getVoyages,
  ajouterSouvenir,
  modifierStatutVoyage,
  supprimerVoyage,
  getCarteVoyages
};