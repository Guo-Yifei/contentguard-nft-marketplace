import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/config.js';
import MARKETPLACE_ABI from '../contracts/Marketplace.json';
import NFT_ABI from '../contracts/NFT.json';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

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

      // Get token owner from NFT contract
      const owner = await nftContract.ownerOf(id);
      
      // Get token URI and metadata
      const tokenURI = await nftContract.tokenURI(id);
      // Convert IPFS URI to HTTP URL
      const httpURI = tokenURI.replace('ipfs://', IPFS_GATEWAY);
      const metadataResponse = await fetch(httpURI);
      const metadata = await metadataResponse.json();

      // Convert image URL if it's IPFS
      const imageUrl = metadata.image.startsWith('ipfs://') 
        ? metadata.image.replace('ipfs://', IPFS_GATEWAY)
        : metadata.image;

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

      // Determine if user is the original owner
      const isOriginalOwner = owner.toLowerCase() === currentWalletAddress.toLowerCase();
      // Determine if NFT is listed
      const isListed = !!marketItem;

      setNft({
        tokenId: id,
        title: metadata.name,
        description: metadata.description,
        imageUrl: imageUrl,
        owner: owner,
        marketItemId: marketItem?.marketItemId,
        price: marketItem ? ethers.formatEther(marketItem.price) : null,
        isOriginalOwner,
        isListed
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

  const handleWithdraw = async () => {
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

      // Cancel the listing
      const tx = await marketplaceContract.cancelMarketItem(
        CONTRACT_ADDRESSES.sepolia.nft,
        marketItemId
      );

      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error withdrawing NFT:', error);
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

  const isDisabled = nft.isOriginalOwner || !nft.isListed;

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
        onClick={isDisabled ? handleWithdraw : handlePurchase}
        disabled={!marketItemId}
        className={`px-4 py-2 rounded mt-4 ${
          !marketItemId
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        style={{ 
          backgroundColor: !marketItemId ? '#fff' : '#1890ff',
          borderColor: !marketItemId ? '#fff' : '#1890ff',
        }}
      >
        {!marketItemId ? 'Not Listed for Sale' : 
         isDisabled ? 'Withdraw' : 'Purchase'}
      </button>
      <div className="mt-2 text-sm text-gray-600">
        {nft.isOriginalOwner && nft.isListed ? 
          "You are the original owner. Click 'Withdraw' to remove from marketplace." :
          nft.isListed ? 
          "This NFT is listed for sale on the marketplace." :
          "This NFT is not currently listed for sale."}
      </div>
    </div>
  );
};

export default NFTDetail;

