import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phonenumber, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '').substring(0, 10);
    const length = digits.length;

    if (length < 4) return digits;
    if (length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    setPhone(formatPhoneNumber(input));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with:', { 
      firstname, 
      lastname, 
      email, 
      phonenumber: phonenumber.replace(/\D/g, ''),
      password 
    });
    
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const digitsOnlyPhone = phonenumber.replace(/\D/g, '');
      console.log('Calling register with:', { 
        firstname, 
        lastname, 
        email, 
        phonenumber: digitsOnlyPhone,
        password 
      });
      
      const response = await register({
        firstname,
        lastname,
        email,
        phonenumber: digitsOnlyPhone,
        password
      });
      
      console.log('Registration response:', response);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Full registration error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className="register-container">
      <div className="homepage-header">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="logo"
          onClick={handleLogoClick}
        />
        <h1 className="app-title">Invoice Management</h1>
      </div>

      <div className="register-form-container">
        <h2 className="register-title">Register</h2>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              placeholder="Enter First Name"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              placeholder="Enter Last Name"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              value={phonenumber}
              onChange={handlePhoneChange}
              placeholder="(123) 456-7890"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="login-link-container">
          Already have an account?{' '}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
