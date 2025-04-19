import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Steps, Typography, Alert, Tooltip } from 'antd';
import { WalletOutlined, CheckCircleOutlined, ExclamationCircleOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

const WalletLogin = () => {
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [stepsStatus, setStepsStatus] = useState({
    metamask: 'wait',
    network: 'wait',
    wallet: 'wait',
    eth: 'wait'
  });
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkSteps();
    // Check steps every 5 seconds
    const interval = setInterval(checkSteps, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if all steps are completed
    const allStepsCompleted = Object.values(stepsStatus).every(status => status === 'finish');
    setIsButtonEnabled(allStepsCompleted);
  }, [stepsStatus]);

  const checkSteps = async () => {
    // Check MetaMask installation
    const hasMetaMask = !!window.ethereum;
    setStepsStatus(prev => ({
      ...prev,
      metamask: hasMetaMask ? 'finish' : 'wait'
    }));

    if (hasMetaMask) {
      try {
        // Check network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const isSepolia = chainId === '0xaa36a7'; // Sepolia chain ID
        setStepsStatus(prev => ({
          ...prev,
          network: isSepolia ? 'finish' : 'wait'
        }));

        // Check wallet connection
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const hasWallet = accounts.length > 0;
        setStepsStatus(prev => ({
          ...prev,
          wallet: hasWallet ? 'finish' : 'wait'
        }));

        // Check ETH balance (simplified check)
        if (hasWallet) {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          });
          const hasEth = parseInt(balance, 16) > 0;
          setStepsStatus(prev => ({
            ...prev,
            eth: hasEth ? 'finish' : 'wait'
          }));
        }
      } catch (error) {
        console.error('Error checking steps:', error);
      }
    }
  };

  const handleConnectWallet = async () => {
    if (!isButtonEnabled) return;
    
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

  const getCurrentStep = () => {
    if (stepsStatus.metamask === 'wait') return 0;
    if (stepsStatus.network === 'wait') return 1;
    if (stepsStatus.wallet === 'wait') return 2;
    if (stepsStatus.eth === 'wait') return 3;
    return 4;
  };

  const getButtonTooltip = () => {
    if (!isButtonEnabled) {
      return 'Complete all steps above to enable the connect button';
    }
    return 'Click to connect your wallet';
  };

  const renderInitialView = () => (
    <div className="w-full h-full flex items-center pl-20">
      <div className="w-[600px]">
        <Title level={1} style={{ color: '#FFFFFF' }} className="text-7xl font-normal mb-6 leading-tight">
          <h1 style={{ color: '#FFFFFF', fontSize: '50px', fontWeight: 'bold', width: '60%', marginLeft: '19%' }}>
            Your gateway to digital collectibles starts here.
          </h1>
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold'}} className="text-xl leading-relaxed mb-10 block">
          <h5 style={{width:'65%', marginLeft:'21%', textAlign:'left', color:'rgba(255, 255, 255, 0.8)'}}>
            Welcome to the next generation of digital art and collectibles. Our marketplace empowers creators 
            to mint and showcase their unique NFTs while providing collectors with a secure platform to discover 
            and own extraordinary digital assets. Built on the Sepolia network, we offer a gas-efficient, 
            environmentally conscious trading experience. Whether you're an artist ready to tokenize your 
            creations or a collector seeking rare digital treasures, your journey into the world of NFTs 
            begins here. Join our growing community of digital pioneers and shape the future of digital ownership.
          </h5>
        </Text>
        <div className="flex flex-col gap-4" style={{marginTop:'60px'}}>
          <Button
            type="primary"
            size="large"
            onClick={handleConnectWallet}
            className="flex items-center justify-center max-w-[280px]"
            style={{
              height: '56px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: '#3B82F6',
              borderColor: '#3B82F6',
              borderRadius: '8px',
              color: '#FFFFFF',
              marginRight: '100px'
            }}
          >
            <WalletOutlined style={{ marginRight: '8px' }} /> Connect Wallet
          </Button>
          <Button
            type="default"
            size="large"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-center max-w-[280px]"
            style={{
              height: '56px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              borderRadius: '8px'
            }}
          >
            <InfoCircleOutlined style={{ marginRight: '8px' }} /> {showInstructions ? 'Hide Instructions' : 'Setup Instructions'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="mt-8">
      <div className="max-w-[60px] p-6 rounded-lg" style={{ 
        backgroundColor: 'rgba(143, 74, 37, 0.87)',
        border: '7px solid rgba(32, 17, 2, 0.8)',
        width: '350px',
        textAlign: 'left',
        marginLeft:'37%',
        marginTop: '15px',
        alignItems: 'center',
        verticalAlign: 'middle'
      }}>
        <Text className="text-xl mb-4 block text-left" style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '15px', marginLeft: '15px',  marginTop: '30px', fontWeight: 'bold' }}>
          How to connect your wallet:
        </Text>
        <div className="space-y-3 text-left" style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '15px', marginBottom: '15px'}}>
          <div className="flex items-start">
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>
              1. Install MetaMask from <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">metamask.io</a>
            </Text>
          </div>
          <div className="flex items-start">
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>2. Select 'Sepolia Test Network' from the network dropdown in MetaMask</Text>
          </div>
          <div className="flex items-start">
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>3. Create a new wallet or import an existing one using your seed phrase</Text>
          </div>
          <div className="flex items-start">
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold' }}>
              4. Get test ETH from <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">sepoliafaucet.com</a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        className="flex-grow flex flex-col min-h-screen"
        style={{
          background: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('/3d-rendering-concept-nft-non-fungible-token-illustration.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div className="w-full h-full flex items-center" style={{ marginTop: '20%', alignItems: 'left' }}>
          <div className="pl-20">
            {renderInitialView()}
            {showInstructions && renderInstructions()}
          </div>
        </div>
      </div>
      <div className="bg-transparent py-6 text-center relative z-10">
        <Text className="text-white opacity-80">© 2025 NFT Marketplace. All rights reserved.</Text>
      </div>
    </div>
  );
};

export default WalletLogin;

