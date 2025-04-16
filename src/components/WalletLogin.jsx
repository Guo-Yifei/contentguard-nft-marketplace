import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

const WalletLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install it to continue.');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const wallet = accounts[0];

      if (!wallet || wallet.length < 42) {
        throw new Error('Invalid wallet address');
      }

      // Save wallet address to localStorage
      localStorage.setItem('walletAddress', wallet);

      // Redirect to home
      navigate('/');
      window.location.reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Connect Your Wallet</h2>

        <Button
          onClick={handleConnectWallet}
          loading={loading}
          type="primary"
          className="w-full"
          style={{
            width: '180px',
            height: '60px',
            fontSize: '17px',
          }}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Please connect your MetaMask wallet to access the NFT marketplace.</p>
        </div>
      </div>
    </div>
  );
};

export default WalletLogin;

