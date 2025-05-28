import axios from 'axios';

const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: 'http://75.119.144.130/api',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  },
  withCredentials: true
}); 
// 1223


// Her istekten önce localStorage'dan token güncelle
api.interceptors.request.use(
  (config) => {
    const newToken = localStorage.getItem('token');
    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
