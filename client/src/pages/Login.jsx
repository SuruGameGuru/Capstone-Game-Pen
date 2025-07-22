import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  return (
    <div className="login-page">
      {/* Fixed Top Header */}
      <header className="login-header">
        <div className="login-concept-text">
          Pen connected to controller by cable: logo
        </div>
        <div className="login-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-panel">
          {/* Panel Header */}
          <div className="login-panel-header">
            <h1 className="login-panel-title">Login</h1>
          </div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-input-group">
              <input
                type="text"
                name="username"
                className="login-input"
                placeholder="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                className="login-input"
                placeholder="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

            <div className="login-signup-prompt">
              <div className="login-signup-text">
                Don't have an account?
              </div>
              <Link to="/signup" className="login-signup-link">
                Sign UP!
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
