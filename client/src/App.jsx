import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider } from './contexts/UserContext';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Upload from './pages/Upload.jsx';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import ExploreArt from './pages/ExploreArt';
import ExploreGames from './pages/ExploreGames';
import Landing from './pages/Landing';
import GenreChannel from './pages/GenreChannel';
import Drafts from './pages/Drafts';
import Display from './pages/Display';
import MyGames from './pages/MyGames';
import MyArt from './pages/MyArt';
import Friends from './pages/Friends';
import DirectMessage from './pages/DirectMessage';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/art" element={<ExploreArt />} />
          <Route path="/explore/games" element={<ExploreGames />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/display/:id" element={<Display />} />
          <Route path="/genre/:genre" element={<GenreChannel />} />
          <Route path="/" element={<Landing />} />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/drafts"
            element={
              <ProtectedRoute>
                <Drafts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mygames"
            element={
              <ProtectedRoute>
                <MyGames />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myart"
            element={
              <ProtectedRoute>
                <MyArt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/direct-message/:friendId/:friendUsername"
            element={
              <ProtectedRoute>
                <DirectMessage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;

// Start Backend
// cd server
// node index.js

// Start Frontend
// cd ../client
// npm start
