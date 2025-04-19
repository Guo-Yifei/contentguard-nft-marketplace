import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers, BrowserProvider } from "ethers";
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "../contracts/config";
import NFT_ABI from "../contracts/NFT.json";
import MARKETPLACE_ABI from "../contracts/Marketplace.json";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [marketContract, setMarketContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);

  // 初始化 Web3
  const initializeWeb3 = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("请安装 MetaMask 钱包！");
      }

      // 创建 provider 和 signer
      const web3Provider = new BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();

      // 获取当前账户
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // 获取网络信息
      const network = await web3Provider.getNetwork();
      const chainId = network.chainId.toString();
      let networkName = "未知网络";

      // 识别网络名称
      if (chainId === "11155111") {
        networkName = "Sepolia测试网";
      } else if (chainId === "1") {
        networkName = "以太坊主网";
      } else if (chainId === "5") {
        networkName = "Goerli测试网";
      } else {
        networkName = `链ID: ${chainId}`;
      }

      // 获取账户余额
      const accountBalance = await web3Provider.getBalance(accounts[0]);
      const formattedBalance = ethers.formatEther(accountBalance);

      // 初始化合约
      const nftContractInstance = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.nft,
        NFT_ABI.abi,
        web3Signer
      );

      const marketContractInstance = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.marketplace,
        MARKETPLACE_ABI.abi,
        web3Signer
      );

      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setNftContract(nftContractInstance);
      setMarketContract(marketContractInstance);
      setNetworkName(networkName);
      setChainId(chainId);
      setBalance(formattedBalance);

      // 将账户地址存储在本地存储中
      localStorage.setItem("walletAddress", accounts[0]);
    } catch (error) {
      console.error("初始化 Web3 失败:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 刷新用户余额
  const refreshBalance = async () => {
    if (provider && account) {
      try {
        const accountBalance = await provider.getBalance(account);
        const formattedBalance = ethers.formatEther(accountBalance);
        setBalance(formattedBalance);
        return formattedBalance;
      } catch (error) {
        console.error("获取余额失败:", error);
        return null;
      }
    }
    return null;
  };

  // 检查网络，如果不是Sepolia，则请求切换
  const checkAndSwitchNetwork = async () => {
    if (!provider) return false;

    try {
      const network = await provider.getNetwork();
      const currentChainId = network.chainId.toString();

      if (currentChainId !== "11155111") {
        try {
          // 请求切换到Sepolia
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // 十六进制的11155111
          });
          return true;
        } catch (switchError) {
          // 如果用户拒绝切换或者网络未添加
          console.error("切换网络失败:", switchError);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("检查网络失败:", error);
      return false;
    }
  };

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("walletAddress", accounts[0]);
          // 当账户变化时，刷新余额
          if (provider) {
            const accountBalance = await provider.getBalance(accounts[0]);
            const formattedBalance = ethers.formatEther(accountBalance);
            setBalance(formattedBalance);
          }
        } else {
          setAccount(null);
          localStorage.removeItem("walletAddress");
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", setAccount);
        window.ethereum.removeListener("chainChanged", () =>
          window.location.reload()
        );
      }
    };
  }, [provider]);

  // 检查是否已连接
  useEffect(() => {
    const checkConnection = async () => {
      const storedAccount = localStorage.getItem("walletAddress");
      if (storedAccount) {
        await initializeWeb3();
      }
    };

    checkConnection();
  }, []);

  const value = {
    account,
    provider,
    signer,
    nftContract,
    marketContract,
    loading,
    error,
    initializeWeb3,
    networkName,
    chainId,
    balance,
    refreshBalance,
    checkAndSwitchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

export default Web3Context;
