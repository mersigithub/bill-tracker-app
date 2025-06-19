import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from './config';
import './ResetPassword.css'; 

const ResetPassword = () => {
  const { token } = useParams();  // Extract token from the URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  console.log('🔑 Token from URL:', token);  // Log token to verify

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      console.log('Reset password URL:', `${BASE_URL}/api/auth/reset-password/${token}`);
      const url = `${BASE_URL}/api/auth/reset-password/${token}`;
  
      const response = await axios.put(
        url,
        { password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        alert('Password changed successfully!');
        navigate('/login');
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert(`Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="reset-form">
      <h2>Reset Password</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
