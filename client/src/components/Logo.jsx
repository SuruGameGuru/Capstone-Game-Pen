import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="gamepen-logo-link">
      <span className="gamepen-logo game">GAME</span>
      <span className="gamepen-logo pen">PEN</span>
    </Link>
  );
};

export default Logo;
