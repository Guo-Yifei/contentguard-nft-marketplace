import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin } from 'antd';
import { Link } from 'react-router-dom';
import PurchaseButton from './PurchaseButton';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/config.js';
import MARKETPLACE_ABI from '../contracts/Marketplace.json';
import NFT_ABI from '../contracts/NFT.json';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const NFTList = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
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

      // Get all market items
      const marketItems = await marketplaceContract.fetchAvailableMarketItems();
      
      // Get all NFTs
      const nfts = await Promise.all(
        marketItems.map(async (item) => {
          try {
            // Get token URI and metadata
            const tokenURI = await nftContract.tokenURI(item.tokenId);
            const httpURI = tokenURI.replace('ipfs://', IPFS_GATEWAY);
            const metadataResponse = await fetch(httpURI);
            const metadata = await metadataResponse.json();

            // Convert image URL if it's IPFS
            const imageUrl = metadata.image.startsWith('ipfs://') 
              ? metadata.image.replace('ipfs://', IPFS_GATEWAY)
              : metadata.image;

            // Get current owner from NFT contract
            const owner = await nftContract.ownerOf(item.tokenId);
            
            // Determine if user is the original owner
            const isOriginalOwner = owner.toLowerCase() === currentWalletAddress.toLowerCase();

            return {
              tokenId: item.tokenId,
              title: metadata.name,
              description: metadata.description,
              imageUrl: imageUrl,
              owner: owner,
              marketItemId: item.marketItemId,
              price: ethers.formatEther(item.price),
              isOriginalOwner,
              isListed: true,
              seller: item.seller
            };
          } catch (error) {
            console.error('Error loading NFT metadata:', error);
            return null;
          }
        })
      );

      // Filter out any failed NFT loads
      setNfts(nfts.filter(nft => nft !== null));
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = async (nft) => {
    if (nft.seller.toLowerCase() === walletAddress.toLowerCase()) {
      // Handle withdraw
      try {
        if (!window.ethereum) {
          throw new Error('Please install MetaMask to use this application');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const marketplaceContract = new ethers.Contract(
          CONTRACT_ADDRESSES.sepolia.marketplace,
          MARKETPLACE_ABI.abi,
          signer
        );

        const tx = await marketplaceContract.cancelMarketItem(
          CONTRACT_ADDRESSES.sepolia.nft,
          nft.marketItemId
        );

        await tx.wait();
        loadNFTs();
      } catch (error) {
        console.error('Error withdrawing NFT:', error);
      }
    } else {
      // Handle purchase
      handlePurchase(nft);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">NFT Marketplace</h1>
      {nfts.length === 0 ? (
        <div className="text-center text-xl mt-8">
          No NFTs listed for sale.
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {nfts.map((nft) => (
            <Col span={8} key={nft.tokenId}>
              <Card
                hoverable
                style={{
                  margin: '30px',
                }}
              >
                <Link to={`/nft/${nft.tokenId}`}>
                  <img
                    src={nft.imageUrl || '/placeholder.png'}
                    alt={nft.title}
                    style={{
                      width: '300px',
                      height: '300px',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.png';
                    }}
                  />
                </Link>
                <div style={{ padding: 14 }}>
                  <h2 className="text-lg font-semibold mb-1 truncate" title={nft.title}>
                    {nft.title}
                  </h2>
                  <p className="text-lg font-bold mb-2">Price: {nft.price} ETH</p>
                  <span className="text-xs text-gray-500" style={{marginRight:'30px'}}>
                    Seller: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                  </span>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => handleButtonClick(nft)}
                      disabled={nft.isOriginalOwner}
                      className={`px-4 py-2 rounded mt-4 ${
                        nft.isOriginalOwner
                          ? 'bg-gray-400 cursor-not-allowed'
                          : nft.seller.toLowerCase() === walletAddress.toLowerCase()
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                      style={{ 
                        backgroundColor: nft.isOriginalOwner 
                          ? '#fff' 
                          : nft.seller.toLowerCase() === walletAddress.toLowerCase()
                          ? '#dc2626'
                          : '#1890ff',
                        borderColor: nft.isOriginalOwner 
                          ? '#fff' 
                          : nft.seller.toLowerCase() === walletAddress.toLowerCase()
                          ? '#dc2626'
                          : '#1890ff',
                      }}
                    >
                      {nft.isOriginalOwner ? 'Your NFT' : 
                       nft.seller.toLowerCase() === walletAddress.toLowerCase() ? 'Withdraw' : 'Purchase'}
                    </button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default NFTList;
