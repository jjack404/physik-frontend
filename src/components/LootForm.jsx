import React, { useState, useEffect, useContext } from 'react';
import { WalletContext } from '../context/WalletContext';
import './LootForm.css';
import axios from 'axios';

const LootForm = ({ position, onClose, onSubmit }) => {
  const { walletAddress } = useContext(WalletContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [activeTab, setActiveTab] = useState('fungible');

  useEffect(() => {
    // Fetch tokens held by the user's wallet
    const fetchTokens = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tokens`, {
          headers: { 'wallet-address': walletAddress },
        });
        console.log('Fetched tokens:', response.data); // Add this line to log the tokens
        setTokens(response.data);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    if (walletAddress) {
      fetchTokens();
    }
  }, [walletAddress]);

  const handleTokenClick = (token) => {
    setSelectedTokens((prevSelectedTokens) => {
      if (prevSelectedTokens.includes(token)) {
        return prevSelectedTokens.filter((t) => t !== token);
      } else {
        return [...prevSelectedTokens, token];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, tokens: selectedTokens });
  };

  const fungibleTokens = tokens.filter(token => !token.isNFT).sort((a, b) => b.amount - a.amount);
  const nfts = tokens.filter(token => token.isNFT);

  console.log('Fungible tokens:', fungibleTokens); // Add this line to log the fungible tokens
  console.log('NFTs:', nfts); // Add this line to log the NFTs

  const abbreviateAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const preventNegativeInput = (e) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  return (
    <div className="loot-form">
      <div className="loot-form-header">
        <h2>Drop Loot</h2>
        {position && (
          <div className="coordinates">
            <span>Lat: {position.lat.toFixed(4)}</span>
            <span>Lng: {position.lng.toFixed(4)}</span>
          </div>
        )}
        <button className="close-button" onClick={onClose}>X</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            className="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            className="description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-inventory">
          <div className="tabs">
            <button
              type="button"
              className={activeTab === 'fungible' ? 'active' : ''}
              onClick={() => setActiveTab('fungible')}
            >
              Fungible Tokens
            </button>
            <button
              type="button"
              className={activeTab === 'nft' ? 'active' : ''}
              onClick={() => setActiveTab('nft')}
            >
              NFTs
            </button>
          </div>
          <div className="tokens-container">
            {activeTab === 'fungible' && fungibleTokens.map((token, index) => (
              <div
                key={index}
                className={`token inventory-fungible-token ${selectedTokens.includes(token) ? 'selected' : ''}`}
                onClick={() => handleTokenClick(token)}
              >
                <div className="token-image-symbol-address">
                  <div className="token-image"> {token.logoURI ? (
                    <img src={token.logoURI} alt={token.mint} />
                  ) : (
                    <div className="no-logo">No Image</div>
                  )}
                  </div>
                  <div className="token-symbol-address">
                    <div className="token-symbol">{token.symbol}</div>
                    <div className="token-address">{abbreviateAddress(token.mint)}</div> {/* Add this line to display the ticker symbol */}
                  </div>
                </div>

                <div className="fungible-balance-input-wrap">
                  <div className="inventory-fungible-balance">{token.amount}</div>
                  <div className="inventory-fungible-input-wrap">
                    <input
                      type="number"
                      step="any"
                      className="fungible-input"
                      placeholder="Amount"
                      onKeyPress={preventNegativeInput}
                    />
                  </div>
                </div>
              </div>
            ))}
            {activeTab === 'nft' && nfts.map((token, index) => (
              <div
                key={index}
                className={`token inventory-nft-token ${selectedTokens.includes(token) ? 'selected' : ''}`}
                onClick={() => handleTokenClick(token)}
              >
                {token.metadata?.image ? (
                  <img src={token.metadata.image} alt={token.mint} />
                ) : (
                  <div className="no-logo">No Image</div>
                )}
                <div className="token-address">{abbreviateAddress(token.mint)}</div>
              </div>
            ))}
          </div>
          <div className="selected-count">
            Selected Tokens: {selectedTokens.length}
          </div>
        </div>
        <button type="submit">Drop!</button>
      </form>
    </div>
  );
};

export default LootForm;
