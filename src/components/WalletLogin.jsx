import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "../contracts/config";

const WalletLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError("");

      // 检查是否安装了 MetaMask
      if (!window.ethereum) {
        throw new Error("请安装 MetaMask 钱包！");
      }

      // 请求用户连接钱包
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // 获取当前网络
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // 如果不是 Sepolia 网络，请求切换
      if (chainId !== NETWORK_CONFIG.sepolia.chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: NETWORK_CONFIG.sepolia.chainId }],
          });
        } catch (switchError) {
          // 如果 Sepolia 网络不存在，添加它
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: NETWORK_CONFIG.sepolia.chainId,
                  chainName: NETWORK_CONFIG.sepolia.chainName,
                  nativeCurrency: NETWORK_CONFIG.sepolia.nativeCurrency,
                  rpcUrls: NETWORK_CONFIG.sepolia.rpcUrls,
                  blockExplorerUrls: NETWORK_CONFIG.sepolia.blockExplorerUrls,
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      // 保存钱包地址
      const walletAddress = accounts[0];
      localStorage.setItem("walletAddress", walletAddress);

      // 导航到主页
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("连接钱包失败:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">连接您的钱包</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={connectWallet}
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{
              width: "180px",
              height: "60px",
              fontSize: "17px",
            }}
          >
            {loading ? "连接中..." : "连接 MetaMask"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>点击按钮连接您的 MetaMask 钱包以访问 NFT 市场</p>
        </div>
      </div>
    </div>
  );
};

export default WalletLogin;
