import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(180deg, #E6B3FF 0%, #87CEEB 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
