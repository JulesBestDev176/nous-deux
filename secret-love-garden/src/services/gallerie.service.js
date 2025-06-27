import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const uploadImage = async (imageFile) => {
  const url = `${API_URL}/api/gallerie`;
  console.log('[API] Appel à :', url);
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('[API] Erreur lors de l’appel à', url, error);
    throw error.response.data;
  }
};

const getImages = async () => {
  const url = `${API_URL}/api/gallerie`;
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
  uploadImage,
  getImages
};