import { useState, useEffect } from 'react'
import { Menu } from 'antd'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import NFTList from './components/NFTList'
import CreateNFT from './components/CreateNFT'
import TransactionNotifications from './components/TransactionNotifications'
import WalletLogin from './components/WalletLogin'
import ProtectedRoute from './components/ProtectedRoute'
import MyAssets from './components/MyAssets'
import NFTDetail from './components/NFTDetail'
import { ethers } from 'ethers'

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const storedWallet = localStorage.getItem('walletAddress');
    if (storedWallet) {
      setWalletAddress(storedWallet);
      fetchBalance(storedWallet);
    }
  }, []);

  const fetchBalance = async (address) => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(Number(ethers.formatEther(balance)).toFixed(5));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('walletAddress');
    setWalletAddress('');
    setBalance('0');
    window.location.reload();
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-gray-800 p-4 mb-8">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {walletAddress && (
                <div className="flex space-x-4">
                  <Menu theme="dark" defaultActive="1" className="el-menu-demo" mode="horizontal">
                    <Menu.Item index="1">
                      <Link to="/" className="text-gray-300 hover:text-white">
                        Marketplace
                      </Link>
                    </Menu.Item>
                    <Menu.Item index="2">
                      <Link to="/create-nft" className="text-gray-300 hover:text-white">
                        Create NFT
                      </Link>
                    </Menu.Item>
                    <Menu.Item index="3"><Link to="/my-assets" className="text-gray-300 hover:text-white">
                      My Assets
                    </Link></Menu.Item>
                    <Menu.Item index="4"><Link to="/notifications" className="text-gray-300 hover:text-white">
                      Cart
                    </Link></Menu.Item>

                    <Menu.Item key="wallet" style={{ marginLeft: 'auto', cursor: 'default' }} disabled={false}>
                      <span style={{ color: '#fff' }}>Wallet: </span>
                      <span style={{ color: '#d97706' }}>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                    </Menu.Item>

                    <Menu.Item key="balance" style={{ cursor: 'default' }} disabled={false}>
                      <span style={{ color: '#fff' }}>Balance: </span>
                      <span style={{ color: '#4ade80' }}>{balance} ETH</span>
                    </Menu.Item>

                    <Menu.Item key="logout">
                      <span onClick={handleLogout}>Logout</span>
                    </Menu.Item>
                  </Menu>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {walletAddress ? (<></>) : (
                <Link to="/login" className="text-gray-300 hover:text-white">
                  Connect Wallet
                </Link>
              )}
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4">
          <Routes>
            <Route path="/login" element={<WalletLogin />} />
            <Route path="/" element={
              <ProtectedRoute>
                <NFTList />
              </ProtectedRoute>
            } />
            <Route path="/create-nft" element={
              <ProtectedRoute>
                <CreateNFT />
              </ProtectedRoute>
            } />
            <Route path="/my-assets" element={
              <ProtectedRoute>
                <MyAssets />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <TransactionNotifications userAddress={walletAddress} />
              </ProtectedRoute>
            } />
            <Route path="/nft/:id" element={<NFTDetail />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white mt-12 py-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 NFT Marketplace. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
