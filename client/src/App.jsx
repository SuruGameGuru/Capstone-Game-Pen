import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Upload from './pages/Upload.jsx';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Landing from './pages/Landing';
import GenreChannel from './pages/GenreChannel';
import Drafts from './pages/Drafts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/drafts" element={<Drafts />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<h2>Page not found</h2>} />
        <Route path="/chat/:genre" element={<GenreChannel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// Start Backend
// cd server
// node index.js

// Start Frontend
// cd ../client
// npm start
