import { useState, useEffect } from "react";
import { Menu } from "antd";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NFTList from "./components/NFTList";
import CreateNFT from "./components/CreateNFT";
import ListNFT from "./components/ListNFT";
import TransactionNotifications from "./components/TransactionNotifications";
import WalletLogin from "./components/WalletLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import MyAssets from "./components/MyAssets";
import NFTDetail from "./components/NFTDetail";
import NetworkStatus from "./components/NetworkStatus";
import { Web3Provider } from "./context/Web3Context";

function App() {
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    if (storedWallet) {
      setWalletAddress(storedWallet);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("walletAddress");
    setWalletAddress("");
    window.location.reload();
  };

  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-gray-800 p-4 mb-8">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-8">
                {walletAddress && (
                  <div className="flex space-x-4">
                    <Menu
                      theme="dark"
                      defaultActive="1"
                      className="el-menu-demo"
                      mode="horizontal"
                    >
                      <Menu.Item index="1">
                        <Link to="/" className="text-gray-300 hover:text-white">
                          市场
                        </Link>
                      </Menu.Item>
                      <Menu.Item index="2">
                        <Link
                          to="/create-nft"
                          className="text-gray-300 hover:text-white"
                        >
                          创建 NFT
                        </Link>
                      </Menu.Item>
                      <Menu.Item index="3">
                        <Link
                          to="/my-assets"
                          className="text-gray-300 hover:text-white"
                        >
                          我的资产
                        </Link>
                      </Menu.Item>
                      <Menu.Item index="4">
                        <Link
                          to="/notifications"
                          className="text-gray-300 hover:text-white"
                        >
                          交易记录
                        </Link>
                      </Menu.Item>

                      <Menu.Item
                        key="wallet"
                        style={{
                          marginLeft: "auto",
                          color: "#fff",
                          cursor: "default",
                        }}
                        disabled={false}
                      >
                        钱包: {walletAddress.slice(0, 6)}...
                        {walletAddress.slice(-4)}
                      </Menu.Item>

                      <Menu.Item key="logout">
                        <span onClick={handleLogout}>退出</span>
                      </Menu.Item>
                    </Menu>
                    <NetworkStatus />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {walletAddress ? (
                  <></>
                ) : (
                  <Link to="/login" className="text-gray-300 hover:text-white">
                    连接钱包
                  </Link>
                )}
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-4">
            <Routes>
              <Route path="/login" element={<WalletLogin />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <NFTList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-nft"
                element={
                  <ProtectedRoute>
                    <CreateNFT />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/list-nft/:tokenId"
                element={
                  <ProtectedRoute>
                    <ListNFT />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-assets"
                element={
                  <ProtectedRoute>
                    <MyAssets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <TransactionNotifications userAddress={walletAddress} />
                  </ProtectedRoute>
                }
              />
              <Route path="/nft/:id" element={<NFTDetail />} />
            </Routes>
          </main>

          <footer className="bg-gray-800 text-white mt-12 py-8">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; 2024 NFT 市场. 保留所有权利.</p>
            </div>
          </footer>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
