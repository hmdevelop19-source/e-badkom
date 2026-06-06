import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AutoLogout from './layout/AutoLogout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const level = currentUser?.level || 'user';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!allowedRoles.includes(level)) {
    let redirectPath = '/admin';
    if (level === 'utd') redirectPath = '/utd';
    else if (level === 'pjutd') redirectPath = '/pjutd';
    
    // If not allowed, redirect to their respective dashboard
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <>
      <AutoLogout onLogout={handleLogout} />
      {children}
    </>
  );
};

export default ProtectedRoute;
