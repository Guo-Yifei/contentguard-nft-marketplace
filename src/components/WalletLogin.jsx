import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WalletLogin = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 这里可以添加钱包地址验证逻辑
      if (walletAddress.length < 42) {
        throw new Error('Invalid wallet address');
      }

      // 存储钱包地址到 localStorage
      localStorage.setItem('walletAddress', walletAddress);
      
      // 导航到主页
      navigate('/');
      window.location.reload(); // 刷新页面以更新导航栏
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Connect Your Wallet
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="wallet" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ethereum Wallet Address
            </label>
            <input
              id="wallet"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Enter your Ethereum wallet address to access the marketplace</p>
        </div>
      </div>
    </div>
  );
};

export default WalletLogin; 