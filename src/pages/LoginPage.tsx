import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

import api from '../api/client';
import logoBadkom from '../assets/LOGOBADKOM.png';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/login', { username, password }, { skipToast: true } as any);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      const userLevel = response.data.user.level;
      if (userLevel === 'utd') {
        navigate('/utd');
      } else if (userLevel === 'pjutd') {
        navigate('/pjutd');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Username atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      
      {/* LEFT PANEL - Branding & Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1E133A] via-[#422F6F] to-[#005c8a] flex-col justify-between p-12 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#008FD7] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#9FD8F5] rounded-full mix-blend-multiply filter blur-[120px] opacity-30"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
            <Shield className="text-[#9FD8F5]" size={24} />
          </div>
          <span className="text-white/90 font-semibold tracking-wider text-sm uppercase letter-spacing-2">Portal Sistem</span>
        </div>

        <div className="relative z-10 max-w-lg mt-20">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6 font-serif">
            Manajemen Tugas &<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9FD8F5] to-white">Evaluasi Terpadu</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Platform digital E-Badkom untuk memonitor, mengevaluasi, dan mengelola seluruh siklus administrasi dengan lebih efisien dan transparan.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 mt-auto pt-12 border-t border-white/10">
          <div className="flex -space-x-4">
             {/* Mock avatars for visual flair */}
            <div className="w-10 h-10 rounded-full border-2 border-[#422F6F] bg-gradient-to-tr from-blue-400 to-indigo-500"></div>
            <div className="w-10 h-10 rounded-full border-2 border-[#422F6F] bg-gradient-to-tr from-purple-400 to-pink-500"></div>
            <div className="w-10 h-10 rounded-full border-2 border-[#422F6F] bg-gradient-to-tr from-teal-400 to-emerald-500"></div>
          </div>
          <p className="text-white/80 text-sm font-medium">Dipercaya oleh <span className="text-white font-bold">100+</span> Lembaga & UT-D</p>
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 relative bg-slate-50/50">
        
        {/* Mobile-only background decorations */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#422F6F]/10 to-transparent"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[420px] relative z-10"
        >
          <div className="text-center lg:text-left mb-10">
            <img src={logoBadkom} alt="Logo E-Badkom" className="w-20 h-20 mb-6 object-contain mx-auto lg:mx-0 drop-shadow-sm" />
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 text-base">Silakan masuk menggunakan kredensial Anda untuk melanjutkan ke dasbor.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-100 flex items-start gap-3"
              >
                <div className="mt-0.5"><Shield size={16} /></div>
                <p className="leading-relaxed">{error}</p>
              </motion.div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400 group-focus-within:text-[#008FD7] transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Masukkan username Anda" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#008FD7]/15 focus:border-[#008FD7] transition-all shadow-sm"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-[#008FD7] transition-colors" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#008FD7]/15 focus:border-[#008FD7] transition-all shadow-sm"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 mt-4 bg-slate-900 hover:bg-[#422F6F] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Memproses...
                </span>
              ) : (
                <>Masuk ke Dasbor <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-10">
            &copy; {new Date().getFullYear()} E-Badkom. Seluruh hak cipta dilindungi.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
