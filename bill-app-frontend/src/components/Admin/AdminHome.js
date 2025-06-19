import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../components/Auth/config';
import './AdminHome.css';

const AdminHome = () => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Now properly used
  const navigate = useNavigate();

  const MAX_ATTEMPTS = 12;

  // Background style as a constant
  const backgroundStyle = {
    backgroundImage: `url(${process.env.PUBLIC_URL + '/images/adminimage.avif'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  };

  useEffect(() => {
    const storedAttempts = localStorage.getItem('admin_attempts');
    const storedDate = localStorage.getItem('admin_attempts_date');
    const today = new Date().toDateString();

    if (storedDate !== today) {
      localStorage.setItem('admin_attempts', '0');
      localStorage.setItem('admin_attempts_date', today);
      setAttempts(0);
    } else if (storedAttempts) {
      setAttempts(parseInt(storedAttempts, 10));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (attempts >= MAX_ATTEMPTS) {
      setError('Too many attempts. Please try again later.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('BASE_URL:', BASE_URL); 
      console.log('Full URL:', `${BASE_URL}/api/admin/login`); 
      const response = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Incorrect passcode.');
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem('admin_attempts', newAttempts.toString());
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div style={backgroundStyle}>
      <h2>Admin Access</h2>
      <h3 style={{ marginBottom: '20px', color: 'red', fontWeight: 'bold' }}>ADMIN ONLY</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          type="password"
          placeholder="Enter Admin Passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="admin-input"
          disabled={attempts >= MAX_ATTEMPTS || isLoading}
        />
        <button 
          type="submit" 
          className="admin-button" 
          disabled={attempts >= MAX_ATTEMPTS || isLoading}
        >
          {isLoading ? 'Verifying...' : 'Enter Dashboard'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AdminHome;