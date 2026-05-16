import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import api from '../api/client';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/login', { username, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Username atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #000052 0%, #00B0FB 100%)',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          borderRadius: '24px', 
          padding: '40px',
          color: 'white'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>E-Badkom</h1>
          <p style={{ opacity: 0.8 }}>Sistem Informasi Layanan Terpadu</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', color: '#fecaca', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <div style={{ position: 'relative' }}>
            <User size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ paddingLeft: '48px' }}
              disabled={isLoading}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '16px', top: '14px', color: '#64748b' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '48px' }}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: isLoading ? 0.7 : 1 }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Login'} <ArrowRight size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
