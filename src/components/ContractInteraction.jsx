import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from "../contracts/config";
import NFT_ABI from "../contracts/NFT.json";
import MARKETPLACE_ABI from "../contracts/Marketplace.json";

function ContractInteraction() {
  const [account, setAccount] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [marketContract, setMarketContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("请安装 MetaMask!");
      }

      // 请求用户连接钱包
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // 切换到 Sepolia 网络
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK_CONFIG.sepolia.chainId }],
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      return { address: accounts[0], signer };
    } catch (error) {
      console.error("连接钱包失败:", error);
      throw error;
    }
  };

  const initializeContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { address, signer } = await connectWallet();

      // 初始化合约
      const nftContractInstance = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.nft,
        NFT_ABI.abi,
        signer
      );

      const marketContractInstance = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.marketplace,
        MARKETPLACE_ABI.abi,
        signer
      );

      setAccount(address);
      setNftContract(nftContractInstance);
      setMarketContract(marketContractInstance);

      // 加载用户拥有的 NFT
      const tokens = await nftContractInstance.getTokensOwnedByMe();
      setOwnedNFTs(tokens);
    } catch (error) {
      console.error("初始化失败:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeContracts();

    // 监听账户变化
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", initializeContracts);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", initializeContracts);
        window.ethereum.removeListener("chainChanged", () =>
          window.location.reload()
        );
      }
    };
  }, []);

  const mintNFT = async (tokenURI) => {
    try {
      setLoading(true);
      setError(null);

      const tx = await nftContract.mintToken(tokenURI);
      await tx.wait();

      // 刷新拥有的 NFT 列表
      const tokens = await nftContract.getTokensOwnedByMe();
      setOwnedNFTs(tokens);

      alert("NFT 铸造成功！");
    } catch (error) {
      console.error("铸造 NFT 失败:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const listNFT = async (tokenId, price) => {
    try {
      setLoading(true);
      setError(null);

      // 获取上市费用
      const listingFee = await marketContract.getListingFee();

      // 创建市场项目
      const tx = await marketContract.createMarketItem(
        CONTRACT_ADDRESSES.sepolia.nft,
        tokenId,
        ethers.utils.parseEther(price), // 转换 ETH 为 Wei
        { value: listingFee }
      );

      await tx.wait();
      alert("NFT 上市成功！");

      // 刷新拥有的 NFT 列表
      const tokens = await nftContract.getTokensOwnedByMe();
      setOwnedNFTs(tokens);
    } catch (error) {
      console.error("上市 NFT 失败:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div className="error">错误: {error}</div>;

  return (
    <div className="contract-interaction">
      <h2>NFT 市场</h2>
      <p>当前账户: {account}</p>

      <div className="mint-section">
        <h3>铸造新 NFT</h3>
        <input
          type="text"
          placeholder="输入 Token URI"
          onChange={(e) => setTokenURI(e.target.value)}
        />
        <button onClick={() => mintNFT(tokenURI)} disabled={loading}>
          铸造 NFT
        </button>
      </div>

      <div className="owned-nfts">
        <h3>您的 NFTs</h3>
        {ownedNFTs.length === 0 ? (
          <p>暂无 NFT</p>
        ) : (
          <div className="nft-grid">
            {ownedNFTs.map((tokenId) => (
              <div key={tokenId.toString()} className="nft-item">
                <p>Token ID: {tokenId.toString()}</p>
                <input
                  type="number"
                  placeholder="价格 (ETH)"
                  onChange={(e) => setPrice(e.target.value)}
                />
                <button
                  onClick={() => listNFT(tokenId, price)}
                  disabled={loading}
                >
                  上市出售
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractInteraction;
