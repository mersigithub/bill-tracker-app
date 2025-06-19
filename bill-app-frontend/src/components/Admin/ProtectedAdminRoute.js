import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  return isAdminAuthenticated ? children : <Navigate to="/admin" />;
};

export default ProtectedAdminRoute;
