import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate token and user data
  const validateUserSession = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return null;
    }
    
    try {
      const user = JSON.parse(userData);
      // Basic validation - check if user has required fields
      if (!user.id || !user.username) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  };

  useEffect(() => {
    const currentUser = validateUserSession();
    console.log('UserContext: Loading user from localStorage:', currentUser);
    if (currentUser) {
      setUser(currentUser);
      console.log('UserContext: User set successfully:', currentUser);
    } else {
      console.log('UserContext: No valid user found in localStorage');
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('UserContext: Login called with:', userData);
    setUser(userData.user);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
    console.log('UserContext: User logged in and stored:', userData.user);
  };

  const logout = () => {
    console.log('UserContext: Logout called');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 