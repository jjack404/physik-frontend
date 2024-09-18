import React, { useContext, useState } from 'react';
import { WalletContext } from '../context/WalletContext';
import './UserProfile.css';

const UserProfile = ({ walletAddress, profile, onClose }) => {
  const { updateProfile } = useContext(WalletContext);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [info, setInfo] = useState(profile?.info || '');

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    // Save the updated profile to the backend
    const updatedProfile = { name, info };
    await updateProfile(updatedProfile);
    setIsEditing(false);
  };

  const getAbbreviatedAddress = (address, length) => {
    return address ? `${address.slice(0, length)}...${address.slice(-4)}` : '';
  };

  const getAvatarText = (address) => {
    return address ? address.slice(0, 7) : '';
  };

  return (
    <div className="dashboard-container">
      <button className="close-button" onClick={onClose}>X</button>
      <div className="dashboard">
        <div className="avatar-username-wrapper">
          <div className="avatar-container">
            <img src={profile?.avatar || `https://placehold.co/100x100?text=${getAvatarText(walletAddress)}`} alt="Avatar" />
          </div>
          <div className="username-edit-container">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dashboard-username-input"
                />
                <button className="save-button" onClick={handleSaveClick}>✔</button>
              </>
            ) : (
              <>
                <h2 className="dashboard-username">{profile?.name || 'Anonymous'}</h2>
                {walletAddress && (
                  <button className="edit-button" onClick={handleEditClick}>Edit</button>
                )}
              </>
            )}
          </div>
        </div>
        <p>{profile?.info || 'No additional information provided.'}</p>
        <h3>Drop History</h3>
        <ul>
          {profile?.history && profile.history.length > 0 ? (
            profile.history.map((drop, index) => (
              <li key={index}>{drop}</li>
            ))
          ) : (
            <li>No drops yet.</li>
          )}
        </ul>
        <p>{getAbbreviatedAddress(walletAddress, 16)}</p>
      </div>
    </div>
  );
};

export default UserProfile;