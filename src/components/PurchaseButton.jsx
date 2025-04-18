import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/config.js';
import MARKETPLACE_ABI from '../contracts/Marketplace.json';
import { message } from 'antd';

const PurchaseButton = ({ nft, buyerAddress }) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      
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
      const priceInWei = ethers.parseEther(nft.price);

      // Create market sale
      const tx = await marketplaceContract.createMarketSale(
        CONTRACT_ADDRESSES.sepolia.nft, // NFT contract address
        nft.marketItemId, // Market item ID
        { value: priceInWei } // Send ETH with the transaction
      );

      // Wait for transaction to be mined
      await tx.wait();
      
      message.success('NFT purchased successfully!');
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      message.error('Failed to purchase NFT: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Disable button if user is the owner
  const isDisabled = loading || nft.owner.toLowerCase() === buyerAddress.toLowerCase();

  return (
    <button
      onClick={handlePurchase}
      disabled={isDisabled}
      className={`px-4 py-2 rounded ${
        isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white`}
      style={{ 
        backgroundColor: isDisabled ? '#fff' : '#1890ff',
        borderColor: isDisabled ? '#fff' : '#1890ff',
      }}
    >
      {loading ? 'Purchasing...' : 
       nft.owner.toLowerCase() === buyerAddress.toLowerCase() ? 'You Own This' : 
       'Purchase'}
    </button>
  );
};

export default PurchaseButton; 