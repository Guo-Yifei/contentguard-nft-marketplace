import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/config.js';
import MARKETPLACE_ABI from '../contracts/Marketplace.json';
import NFT_ABI from '../contracts/NFT.json';

const NFTDetail = () => {
  const { id } = useParams();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [marketItemId, setMarketItemId] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    loadNFT();
  }, [id]);

  const loadNFT = async () => {
    try {
      setLoading(true);
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentWalletAddress = await signer.getAddress();
      setWalletAddress(currentWalletAddress);

      // Initialize contracts
      const marketplaceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.marketplace,
        MARKETPLACE_ABI.abi,
        provider
      );

      const nftContract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.nft,
        NFT_ABI.abi,
        provider
      );

      // Get token owner
      const owner = await nftContract.ownerOf(id);
      
      // Get token URI and metadata
      const tokenURI = await nftContract.tokenURI(id);
      const metadataResponse = await fetch(tokenURI);
      const metadata = await metadataResponse.json();

      // Check if NFT is listed on marketplace
      const marketItems = await marketplaceContract.fetchAvailableMarketItems();
      const marketItem = marketItems.find(item => 
        item.tokenId.toString() === id.toString() && 
        !item.sold && 
        !item.canceled
      );

      if (marketItem) {
        setMarketItemId(marketItem.marketItemId);
        setPrice(ethers.formatEther(marketItem.price));
      }

      setNft({
        tokenId: id,
        title: metadata.name,
        description: metadata.description,
        imageUrl: metadata.image,
        owner: owner,
        marketItemId: marketItem?.marketItemId,
        price: marketItem ? ethers.formatEther(marketItem.price) : null
      });
    } catch (error) {
      console.error('Error loading NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize marketplace contract
      const marketplaceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.marketplace,
        MARKETPLACE_ABI.abi,
        signer
      );

      // Get the price in wei
      const priceInWei = ethers.parseEther(price);

      // Create market sale
      const tx = await marketplaceContract.createMarketSale(
        CONTRACT_ADDRESSES.sepolia.nft, // NFT contract address
        marketItemId, // Market item ID
        { value: priceInWei } // Send ETH with the transaction
      );

      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error purchasing NFT:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!nft) {
    return <div>NFT not found or you don't have permission to view it.</div>;
  }

  const isDisabled = nft.owner.toLowerCase() === walletAddress.toLowerCase() || !marketItemId;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{nft.title}</h1>
      <img
        src={nft.imageUrl || '/placeholder.png'}
        alt={nft.title}
        style={{
          width: '500px',
          height: '500px',
          objectFit: 'cover',
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder.png';
        }}
      />
      <div style={{ textAlign: 'left' }}>
        <h4 className="text-lg font-bold mt-4">Owner: {nft.owner}</h4>
        <p className="text-md mt-2">{nft.description}</p>
        {price && <p className="text-lg font-bold mt-2">Price: {price} ETH</p>}
      </div>
      <button
        onClick={handlePurchase}
        disabled={isDisabled}
        className={`px-4 py-2 rounded mt-4 ${
          isDisabled
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        style={{ 
          backgroundColor: isDisabled ? '#fff' : '#1890ff',
          borderColor: isDisabled ? '#fff' : '#1890ff',
        }}
      >
        {isDisabled ? 
          (nft.owner.toLowerCase() === walletAddress.toLowerCase() ? 'You Own This' : 'Not Listed for Sale') : 
          'Purchase'}
      </button>
    </div>
  );
};

export default NFTDetail;

