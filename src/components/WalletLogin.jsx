import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Steps, Typography, Alert } from 'antd';
import { WalletOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <div className="text-center mb-8">
          <WalletOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={2} className="mt-4 font-extrabold">Connect Your Wallet</Title>
          <Text type="secondary" className="text-lg">
            To start trading NFTs, you need to connect your MetaMask wallet
          </Text>
        </div>

        <div className="mb-8">
          <Steps direction="vertical" current={0}>
            <Step 
              title="Install MetaMask" 
              description={
                <div className="mt-2">
                  <Text>If you don't have MetaMask installed, download it from the official website:</Text>
                  <div className="mt-2">
                    <a 
                      href="https://metamask.io/download/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 font-bold"
                    >
                      Download MetaMask
                    </a>
                  </div>
                </div>
              }
            />
            <Step 
              title="Create or Import Wallet" 
              description="Create a new wallet or import an existing one using your seed phrase"
            />
            <Step 
              title="Connect to Sepolia Network" 
              description={
                <div>
                  <Text>Make sure you're connected to the Sepolia test network:</Text>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Click on the network dropdown in MetaMask</li>
                    <li>Select 'Sepolia Test Network'</li>
                    <li>If not listed, add it manually with these details:
                      <ul className="list-disc pl-6 mt-1">
                        <li>Network Name: Sepolia</li>
                        <li>RPC URL: https://rpc.sepolia.org</li>
                        <li>Chain ID: 11155111</li>
                        <li>Currency Symbol: ETH</li>
                      </ul>
                    </li>
                  </ul>
                </div>
              }
            />
            <Step 
              title="Get Test ETH" 
              description={
                <div>
                  <Text>You'll need some test ETH to interact with the marketplace:</Text>
                  <div className="mt-2">
                    <a 
                      href="https://sepoliafaucet.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 font-bold"
                    >
                      Get Sepolia Test ETH
                    </a>
                  </div>
                </div>
              }
            />
          </Steps>
        </div>

        <div className="text-center">
          <Button
            onClick={handleConnectWallet}
            loading={loading}
            type="primary"
            size="large"
            className="w-full max-w-xs"
            style={{
              height: '50px',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
            icon={<WalletOutlined />}
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>

          <Alert
            message="Important"
            description="Make sure you're using MetaMask and connected to the Sepolia network before connecting your wallet."
            type="info"
            showIcon
            icon={<ExclamationCircleOutlined />}
            className="mt-6"
          />
        </div>
      </Card>
    </div>
  );
};

export default WalletLogin;

