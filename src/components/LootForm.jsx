import React, { useState, useEffect, useContext } from 'react';
import { WalletContext } from '../context/WalletContext';
import axios from 'axios';
import './LootForm.css';

const LootForm = ({ position, onClose, onSubmit }) => {
  const { walletAddress } = useContext(WalletContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [activeTab, setActiveTab] = useState('fungible');
  const [isConfirming, setIsConfirming] = useState(false);
  const [tokenAmounts, setTokenAmounts] = useState({});

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tokens`, {
          headers: { 'wallet-address': walletAddress },
        });
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

  const handleAmountChange = (token, amount) => {
    setTokenAmounts((prevAmounts) => ({
      ...prevAmounts,
      [token.mint]: amount,
    }));
  };

  const isAmountValid = () => {
    return selectedTokens.every(token => {
      const specifiedAmount = tokenAmounts[token.mint] || 0;
      return specifiedAmount <= token.amount;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAmountValid()) {
      setIsConfirming(true);
    }
  };

  const handleConfirmDrop = async () => {
    try {
      const tokensToDrop = selectedTokens.map(token => ({
        ...token,
        amount: tokenAmounts[token.mint] || token.amount,
      }));

      await onSubmit({ title, description, tokens: tokensToDrop, position });

      setIsConfirming(false);
      onClose();
    } catch (error) {
      console.error('Error confirming drop:', error);
    }
  };

  const fungibleTokens = tokens.filter(token => !token.isNFT).sort((a, b) => b.amount - a.amount);
  const nfts = tokens.filter(token => token.isNFT);

  const abbreviateAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const preventNegativeInput = (e) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  const getStaticMapUrl = () => {
    const lat = position.lat.toFixed(4);
    const lng = position.lng.toFixed(4);
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Access the API key
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=7&size=600x150&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
  };

  return (
    <div className="loot-form">
      <div className="loot-form-header">
        {isConfirming ? (
          <>
            <h2>{title}</h2>
            <button className="close-button" onClick={onClose}>X</button>
          </>
        ) : (
          <>
            <h2>Drop Loot</h2>
            <button className="close-button" onClick={onClose}>X</button>
          </>
        )}
      </div>
      {isConfirming ? (
        <div className="confirmation-view">
          <p>{description}</p>
          <img src={getStaticMapUrl()} alt="Map" className="static-map" />
          <div className="coordinates-row">
            <span>Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}</span>
          </div>
          <ul className="token-list">
            {selectedTokens.map((token, index) => (
              <li key={index} className="token-list-item">
                <div className="token-info">
                  {token.isNFT ? (
                    <>
                      {token.metadata?.image && (
                        <img src={token.metadata.image} alt={token.mint} className="token-list-image" />
                      )}
                      {abbreviateAddress(token.mint)}
                    </>
                  ) : (
                    <>
                      {token.logoURI && (
                        <img src={token.logoURI} alt={token.symbol} className="token-list-image" />
                      )}
                      {token.symbol}
                    </>
                  )}
                </div>
                <div className="token-amount">
                  {tokenAmounts[token.mint] || token.amount}
                </div>
              </li>
            ))}
          </ul>
          <button className="confirm-button" onClick={handleConfirmDrop}>Confirm Drop!</button>
        </div>
      ) : (
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
          <div className="form-group desc-group">
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
                    <div className="token-image">
                      {token.logoURI ? (
                        <img src={token.logoURI} alt={token.mint} />
                      ) : (
                        <div className="no-logo">No Image</div>
                      )}
                    </div>
                    <div className="token-symbol-address">
                      <div className="token-symbol">{token.symbol}</div>
                      <div className="token-address">{abbreviateAddress(token.mint)}</div>
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
                        value={tokenAmounts[token.mint] || ''}
                        onChange={(e) => handleAmountChange(token, e.target.value)}
                        onKeyDown={preventNegativeInput}
                        style={{
                          borderColor: tokenAmounts[token.mint] > token.amount ? 'red' : '',
                        }}
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
          <button className="drop-button" type="submit" disabled={!isAmountValid()}>Drop!</button>
        </form>
      )}
    </div>
  );
};

export default LootForm;
