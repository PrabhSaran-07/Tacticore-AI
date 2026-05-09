import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (data) => api.post('/auth/register', data);
export const fetchScenarios = () => api.get('/scenarios');
export const startSimulation = (payload) => api.post('/simulation/start', payload);
export const evaluate = (payload) => api.post('/evaluation', payload);

export default api;
