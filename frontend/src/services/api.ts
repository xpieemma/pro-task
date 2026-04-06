import axios from 'axios';

const api = axios.create({
        baseURL: process.env.VITE_API_URL || 'http://localhost:5000/api',
      });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    // If the request succeeds, just return the data normally
    return response;
  },
  (error) => {
    // If the backend kicks back a 401 Unauthorized (invalid/expired token)
    if (error.response && error.response.status === 401) {
      console.warn('Token expired or invalid. Logging out...');
      localStorage.removeItem('token'); // Clear the bad token
      window.location.href = '/login';  // Force redirect to login page
    }
    return Promise.reject(error);
  }
);

export default api;
