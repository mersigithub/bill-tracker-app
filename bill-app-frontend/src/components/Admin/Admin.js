import { Routes, Route, Navigate } from 'react-router-dom';
import AdminHome from './AdminHome';
import AdminDashboard from './AdminDashboard';
import { useState, useEffect } from 'react';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuthenticated') === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem('adminAuthenticated') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handlePasscodeVerified = () => {
    setIsAuthenticated(true);
    localStorage.setItem('adminAuthenticated', 'true');
  };

  return (
    <Routes>
      <Route index element={
        isAuthenticated ? (
          <Navigate to="/admin/dashboard" replace />
        ) : (
          <AdminHome onPasscodeVerified={handlePasscodeVerified} />
        )
      } />
      
      <Route path="dashboard" element={
        isAuthenticated ? (
          <AdminDashboard />
        ) : (
          <Navigate to="/admin" replace />
        )
      } />
    </Routes>
  );
};

export default Admin;