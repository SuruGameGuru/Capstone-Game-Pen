import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import api from '../services/api';
import '../styles/Signup.css';
import '../styles/accross_page_styles.css';

const Signup = () => {
  const { login } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const response = await api.post('/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        dateOfBirth: formData.dateOfBirth,
      });

      // Use the context login function
      login(response.data);

      // Redirect to profile or dashboard
      navigate('/profile');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      
      // Check if it's a "user already exists" error
      if (errorMessage.toLowerCase().includes('already exists')) {
        // Show custom notification
        setNotificationMessage('Account already exists. Please login.');
        setShowNotification(true);
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          setShowNotification(false);
          navigate('/login');
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <header className="page-header">
        <div className="page-concept-text">GamePen Concept</div>
        <Link to="/" className="page-logo-title">
          <span className="game">Game</span>
          <span className="pen">Pen</span>
        </Link>
      </header>

      <main className="page-main">
        <div className="page-panel">
          <div className="signup-panel-header">
            <h2 className="signup-panel-title">Create Account</h2>
            <p className="signup-panel-subtitle">Join the GamePen community</p>
          </div>

          <form className="page-form" onSubmit={handleSubmit}>
            <div className="page-input-group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="page-input"
                placeholder="Username"
              />
            </div>

            <div className="page-input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="page-input"
                placeholder="Email"
              />
            </div>

            <div className="page-input-group">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="page-input"
              />
            </div>

            <div className="page-input-group">
              <div className="page-password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="page-password-input"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="page-password-toggle-btn"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="page-input-group">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="page-input"
                placeholder="Confirm Password"
              />
            </div>

            {error && <div className="page-error-message">{error}</div>}

            <button type="submit" className="page-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="signup-login-prompt">
            <p className="signup-login-text">
              Already have an account?{' '}
              <Link to="/login" className="page-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      {/* Notification Popup */}
      {showNotification && (
        <div className="notification-popup">
          <div className="notification-content">
            <p>{notificationMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
