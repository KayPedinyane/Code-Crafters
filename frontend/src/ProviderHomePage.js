import React, { useEffect, useState } from 'react';
import './ProviderHomePage.css';
import { useNavigate } from 'react-router-dom';

function ProviderHomePage() {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const fullText = "Empowering the next generation of South African talent";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="provider-container">

      {/* Profile section - top right */}
      <div className="provider-header">
        <span className="profile-icon">👤 Profile</span>
      </div>

      {/* Creative banner */}
      <div className="provider-banner">
        <h2 className="typewriter-text">{displayText}<span className="cursor">|</span></h2>
        <div className="ambient-line"></div>
      </div>

      {/* Buttons */}
      <div className="provider-actions">
        <button onClick={() => navigate('/post-opportunity')}>
          POST
        </button>
        <button onClick={() => navigate('/my-listings')}>
          MY LISTINGS ☰
        </button>
      </div>

    </div>
  );
}

export default ProviderHomePage;