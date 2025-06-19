import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BASE_URL from './config';
import './ForgotPassword.css'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = `${BASE_URL}/api/auth/forgot-password`;
      console.log('Attempting POST to:', url);
      
      setIsLoading(true);
      const response = await axios.post(
        url,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );
  
      console.log('Full response:', response);
      setMessage(response.data.message);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Complete error:', {
        config: error.config,
        response: error.response,
        message: error.message
      });
      
      setError(error.response?.data?.message || 
              error.message || 
              'Failed to send reset email');
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-form">
      <h2>Forgot Password</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
