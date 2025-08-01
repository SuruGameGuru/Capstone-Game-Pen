import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Login.css';
import '../styles/accross_page_styles.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    // Temporarily bypass authentication for testing
    // try {
    //   const response = await api.post('/auth/login', {
    //     email: formData.email,
    //     password: formData.password,
    //   });

    //   // Store token
    //   localStorage.setItem('token', response.data.token);

    //   // Redirect to profile or dashboard
    //   navigate('/profile');
    // } catch (err) {
    //   setError(err.response?.data?.message || 'Login failed');
    // } finally {
    //   setLoading(false);
    // }

    // Temporary: just navigate to profile
    setTimeout(() => {
      localStorage.setItem('token', 'fake-token-for-testing');
      navigate('/profile');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="login-page">
      <header className="page-header">
        <div className="page-concept-text">GamePen Concept</div>
        <Link to="/" className="page-logo-title">
          <span className="game">Game</span>
          <span className="pen">Pen</span>
        </Link>
      </header>
      
      <main className="page-main">
        <div className="page-panel">
          <div className="login-panel-header">
            <h2 className="login-panel-title">Welcome Back</h2>
            <p className="login-panel-subtitle">Sign in to your account</p>
          </div>
          
          <form className="page-form" onSubmit={handleSubmit}>
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

            {error && <div className="page-error-message">{error}</div>}

            <button type="submit" className="page-button" disabled={loading}>
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>
          
          <div className="login-signup-prompt">
            <p className="login-signup-text">
              Don't have an account? <Link to="/signup" className="page-link">Sign up</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
