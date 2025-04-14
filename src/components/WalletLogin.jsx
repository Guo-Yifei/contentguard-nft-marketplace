import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input } from 'antd';

const WalletLogin = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    const { title } = values;

    try {
      if (title.length < 42) {
        throw new Error('Invalid wallet address');
      }

      localStorage.setItem('walletAddress', title);
      navigate('/');
      window.location.reload(); // optional, depending on your app logic
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
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Ethereum Wallet Address"
            name="title"
            rules={[{ required: true, message: 'Please input address!' }]}
          >
            <Input
              placeholder="Enter wallet address"
              onChange={(e) => setWalletAddress(e.target.value)}
              value={walletAddress}
            />
          </Form.Item>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              width: '180px',
              height: '60px',
              fontSize: '17px',
            }}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </Form>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Enter your Ethereum wallet address to access the marketplace</p>
        </div>
      </div>
    </div>
  );
};

export default WalletLogin;
