import React, { useContext } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletContext } from '../context/WalletContext';
import './NavBar.css';

const NavBar = ({ onProfileClick }) => {
  const { walletAddress } = useContext(WalletContext);

  return (
    <nav className="navbar">
      <div className="logo"><h1>PHYSIK</h1></div>
      <div className="walletButton">
        {walletAddress && (
          <button className="dashboard-button" onClick={onProfileClick}>
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.9778 3.16455C7.60209 3.16455 3.22852 7.53813 3.22852 12.9138C3.22852 18.2895 7.60209 22.6631 12.9778 22.6631C18.3535 22.6631 22.727 18.2895 22.727 12.9138C22.727 7.53813 18.3535 3.16455 12.9778 3.16455ZM10.6239 8.64008C11.2178 8.01059 12.0535 7.66421 12.9778 7.66421C13.9021 7.66421 14.7303 8.01294 15.3265 8.6457C15.9307 9.2869 16.2246 10.1484 16.1552 11.0746C16.0165 12.9138 14.5916 14.4137 12.9778 14.4137C11.364 14.4137 9.93629 12.9138 9.80036 11.0741C9.73146 10.1404 10.0249 9.27612 10.6239 8.64008ZM12.9778 21.1632C11.8765 21.1639 10.7863 20.9435 9.77184 20.515C8.75737 20.0865 7.83926 19.4587 7.07197 18.6687C7.51142 18.042 8.07135 17.5092 8.71904 17.1013C9.91379 16.3354 11.4259 15.9136 12.9778 15.9136C14.5297 15.9136 16.0418 16.3354 17.2351 17.1013C17.8833 17.509 18.4438 18.0418 18.8836 18.6687C18.1164 19.4587 17.1983 20.0867 16.1838 20.5152C15.1693 20.9437 14.0791 21.164 12.9778 21.1632Z" fill="#fffbbd"/>
            </svg>
          </button>
        )}
        <WalletMultiButton />
      </div>
    </nav>
  );
};

export default NavBar;
