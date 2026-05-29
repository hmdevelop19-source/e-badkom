import axios from 'axios';
import NProgress from 'nprogress';
import toast from 'react-hot-toast';

// Configure NProgress
NProgress.configure({ showSpinner: false, speed: 400 });

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  NProgress.start();
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  NProgress.done();
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    NProgress.done();
    
    // Automatically show success toast for mutations (POST, PUT, DELETE)
    // Only if the request explicitly wants to skip it via custom config (skipToast)
    const method = response.config.method?.toUpperCase();
    const skipToast = (response.config as any).skipToast;
    
    if (!skipToast && ['POST', 'PUT', 'DELETE'].includes(method || '')) {
      // You can customize the success message or use backend message if available
      const msg = response.data?.message || 'Data berhasil disimpan!';
      toast.success(msg);
    }
    
    return response;
  },
  (error) => {
    NProgress.done();
    
    const skipToast = (error.config as any)?.skipToast;
    
    if (error.response?.status === 401) {
      // Clear user session
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Prevent spamming the toast and redirect to login
      if (!skipToast) {
        toast.error('Sesi telah berakhir, silakan login kembali');
      }
      
      // Redirect to login after a brief delay so toast can be seen
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
      return Promise.reject(error);
    }
    
    if (!skipToast) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan pada server.';
      toast.error(msg);
    }
    
    return Promise.reject(error);
  }
);

export default api;
