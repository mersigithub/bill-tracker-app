import React from 'react';
import { useAuth } from './Auth/AuthContext';
import { Link } from 'react-router-dom';
import './Homepage.css';
import InvoiceChart from './InvoiceChart';

const Homepage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return React.createElement('div', { className: 'homepage-container' }, 'Loading...');
  }

  return React.createElement(
    'div',
    { className: 'homepage-container' },
    // Background Video
    React.createElement(
      'video',
      { autoPlay: true, muted: true, loop: true, className: 'background-video' },
      React.createElement('source', { src: '/videos/video1.mov', type: 'video/mp4' }),
      'Your browser does not support the video tag.'
    ),

    // Header
    React.createElement(
      'header',
      { className: 'homepage-header' },
      React.createElement(
        'div',
        { className: 'header-left-section' },
        React.createElement(
          'a',
          { href: '/' },
          React.createElement('img', { src: '/images/logo.png', alt: 'Logo', className: 'logo' })
        ),
        React.createElement('h1', { className: 'app-title' }, 'Invoice Management Systems')
      ),
      React.createElement(
        'div',
        { className: 'header-right-section' },
        user && user.username
          ? React.createElement('div', { className: 'welcome-message' }, `Welcome, ${user.username}`)
          : React.createElement(
              'nav',
              { className: 'auth-links' },
              React.createElement(Link, { to: '/login', className: 'auth-link' }, 'Login'),
              React.createElement(Link, { to: '/register', className: 'auth-link' }, 'Register'),
              React.createElement(Link, { to: '/contact', className: 'auth-link' }, 'Contact Us')
            )
      )
    ),

    // Intro Section
    React.createElement(
      'section',
      { className: 'homepage-intro' },
      React.createElement(
        'div',
        { className: 'intro-content' },
        React.createElement('h2', null, 'Smart & Secure Invoice Management'),
        React.createElement(
          'p',
          null,
          'Simplify your financial workflows with our intuitive platform. Upload, track, and manage invoices in one secure place — designed for businesses, freelancers, and finance teams.'
        ),
        React.createElement(
          'p',
          null,
          'Get started today to improve accuracy, save time, and gain control over your billing process.'
        ),

        // Visuals
        React.createElement(
          'div',
          { className: 'visuals-container' },
          React.createElement(
            'div',
            { className: 'image-column' },
            React.createElement('img', {
              src: '/images/graph1.png',
              alt: 'Graph 1',
              className: 'graph-image',
            }),
            React.createElement('img', {
              src: '/images/graph2.jpg',
              alt: 'Graph 2',
              className: 'graph-image',
            })
          ),
          React.createElement(
            'div',
            { className: 'chart-column' },
            React.createElement(InvoiceChart, null)
          )
        ),

        React.createElement(Link, { to: '/register', className: 'cta-button' }, 'Create Free Account')
      )
    )
  );
};

export default Homepage;
