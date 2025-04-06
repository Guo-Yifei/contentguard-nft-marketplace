import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import NFTList from './components/NFTList'
import CreateNFT from './components/CreateNFT'
import TransactionNotifications from './components/TransactionNotifications'
import WalletLogin from './components/WalletLogin'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const storedWallet = localStorage.getItem('walletAddress');
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('walletAddress');
    setWalletAddress('');
    window.location.reload();
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-gray-800 p-4 mb-8">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-white text-xl font-bold">
                NFT Marketplace
              </Link>
              {walletAddress && (
                <div className="flex space-x-4">
                  <Link to="/" className="text-gray-300 hover:text-white">
                    Marketplace
                  </Link>
                  <Link to="/create-nft" className="text-gray-300 hover:text-white">
                    Create NFT
                  </Link>
                  <Link to="/my-assets" className="text-gray-300 hover:text-white">
                    My Assets
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {walletAddress ? (
                <>
                  <Link to="/notifications" className="text-gray-300 hover:text-white">
                    Notifications
                  </Link>
                  <span className="text-gray-300">
                    Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
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
            <Route path="/notifications" element={
              <ProtectedRoute>
                <TransactionNotifications userAddress={walletAddress} />
              </ProtectedRoute>
            } />
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
