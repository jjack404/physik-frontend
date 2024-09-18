import React, { useState } from 'react';
import NavBar from './components/NavBar';
import Map from './components/Map';
import { WalletProviderWrapper, WalletContext } from './context/WalletContext';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  const [showProfile, setShowProfile] = useState(false);

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  return (
    <WalletProviderWrapper>
      <div className="app-container">
        <NavBar onProfileClick={handleProfileClick} />
        <div className="map-container">
          <Map />
        </div>
        <div className="bottom-bar">Bottom Bar</div>
        <WalletContext.Consumer>
          {({ walletAddress, profile }) => (
            showProfile && (
              <div className="self-profile">
                <UserProfile walletAddress={walletAddress} profile={profile} onClose={handleCloseProfile} />
              </div>
            )
          )}
        </WalletContext.Consumer>
      </div>
    </WalletProviderWrapper>
  );
}

export default App;
