import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Drafts.css';
import '../styles/Profile.css'; // For profile-route-btn

const Drafts = () => {
  const [drafts, setDrafts] = useState([
    {
      id: 1,
      title: 'Space Adventure Game',
      type: 'Game',
      description: 'A 2D platformer set in space with unique gravity mechanics and puzzle elements.',
      date: '2024-01-15',
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'Character Concept Art',
      type: 'Art',
      description: 'Main character designs for the fantasy RPG project with detailed backstories.',
      date: '2024-01-12',
      status: 'draft'
    },
    {
      id: 3,
      title: 'Level Design Sketches',
      type: 'Game',
      description: 'Initial level layouts and environmental concepts for the first three stages.',
      date: '2024-01-10',
      status: 'completed'
    },
    {
      id: 4,
      title: 'UI Mockups',
      type: 'Art',
      description: 'User interface designs and wireframes for the mobile game interface.',
      date: '2024-01-08',
      status: 'draft'
    },
    {
      id: 5,
      title: 'Sound Effects Collection',
      type: 'Audio',
      description: 'Custom sound effects and ambient audio for the horror game project.',
      date: '2024-01-05',
      status: 'in-progress'
    },
    {
      id: 6,
      title: 'Storyboard Sequences',
      type: 'Art',
      description: 'Animated storyboard sequences for the opening cinematic and key moments.',
      date: '2024-01-03',
      status: 'draft'
    }
  ]);

  const [selectedDraft, setSelectedDraft] = useState(null);

  const handleDraftClick = (draft) => {
    setSelectedDraft(draft);
    // Handle draft selection logic here
    console.log('Selected draft:', draft);
  };

  const handleNewDraft = () => {
    // Handle new draft creation logic here
    console.log('Create new draft');
  };

  const handleDeleteDraft = (draftId) => {
    setDrafts(drafts.filter(draft => draft.id !== draftId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'draft';
      case 'in-progress':
        return 'in-progress';
      case 'completed':
        return 'completed';
      default:
        return 'draft';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="drafts-page">
      {/* Fixed Top Navigation Bar */}
      <header className="drafts-header">
        <div className="drafts-logo-title">
          <span className="game">GAME</span>
          <span className="pen">PEN</span>
        </div>
        
        <nav className="drafts-navbar">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/profile" className="profile-route-btn" title="Profile">
            <span role="img" aria-label="profile">👤</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="drafts-main">
        <h1 className="drafts-title">My Drafts</h1>
        
        <div className="drafts-container">
          {drafts.length > 0 ? (
            <>
              <div className="drafts-grid">
                {drafts.map((draft) => (
                  <div 
                    key={draft.id} 
                    className="draft-card"
                    onClick={() => handleDraftClick(draft)}
                  >
                    <div className="draft-card-header">
                      <h3 className="draft-title">{draft.title}</h3>
                      <span className="draft-type">{draft.type}</span>
                    </div>
                    
                    <p className="draft-description">{draft.description}</p>
                    
                    <div className="draft-meta">
                      <span className="draft-date">{formatDate(draft.date)}</span>
                      <span className={`draft-status ${getStatusColor(draft.status)}`}>
                        {draft.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="drafts-actions">
                <button className="drafts-btn" onClick={handleNewDraft}>
                  Create New Draft
                </button>
                <button className="drafts-btn secondary">
                  Export All
                </button>
              </div>
            </>
          ) : (
            <div className="drafts-empty">
              <div className="drafts-empty-icon">📝</div>
              <h2 className="drafts-empty-title">No Drafts Yet</h2>
              <p className="drafts-empty-text">
                Start creating your first draft to see it here!
              </p>
              <button className="drafts-btn" onClick={handleNewDraft}>
                Create Your First Draft
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Drafts; 