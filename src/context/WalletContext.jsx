import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import axios from 'axios';

const WalletContext = createContext();

const WalletContextProvider = ({ children }) => {
  const wallets = [new PhantomWalletAdapter()];
  const [walletAddress, setWalletAddress] = useState(null);
  const [profile, setProfile] = useState(null);

  const { publicKey } = useWallet();

  useEffect(() => {
    if (publicKey) {
      const address = publicKey.toString();
      setWalletAddress(address);
      fetchProfile(address);
    } else {
      setWalletAddress(null);
      setProfile(null);
    }
  }, [publicKey]);

  const fetchProfile = async (address) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/profile/${address}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <WalletContext.Provider value={{ walletAddress, profile, setProfile }}>
      {children}
    </WalletContext.Provider>
  );
};

const WalletProviderWrapper = ({ children }) => {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export { WalletContext, WalletProviderWrapper, useContext };
