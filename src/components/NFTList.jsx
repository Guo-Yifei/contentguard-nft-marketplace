import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Button } from 'antd';
import { Link } from 'react-router-dom';
import { EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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
              seller: item.seller,
              marketItemId: item.marketItemId,
              price: ethers.formatEther(item.price),
              isOriginalOwner,
              isListed: true
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

  const handlePurchase = async (nft) => {
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

      // Convert price to wei (smallest unit of ETH)
      const priceInWei = ethers.parseEther(nft.price);

      // Create market sale with the price in ETH
      const tx = await marketplaceContract.createMarketSale(
        CONTRACT_ADDRESSES.sepolia.nft,
        nft.marketItemId,
        { value: priceInWei } // Send ETH with the transaction
      );

      // Wait for transaction to be mined
      await tx.wait();
      
      // Refresh the NFTs list
      loadNFTs();
    } catch (error) {
      console.error('Error purchasing NFT:', error);
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
            <Col xs={24} sm={12} md={8} lg={6} key={nft.tokenId}>
              <Card
                hoverable
                cover={
                  <Link to={`/nft/${nft.tokenId}`}>
                    <div style={{ height: '300px', overflow: 'hidden' }}>
                      <img
                        src={nft.imageUrl || '/placeholder.png'}
                        alt={nft.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </div>
                  </Link>
                }
                actions={[
                  <Link to={`/nft/${nft.tokenId}`} key="view">
                    <EyeOutlined /> View
                  </Link>,
                  <Button
                    type={nft.seller.toLowerCase() === walletAddress.toLowerCase() ? 'danger' : 'primary'}
                    icon={<ShoppingCartOutlined />}
                    onClick={() => handleButtonClick(nft)}
                    disabled={nft.isOriginalOwner}
                    key="buy"
                  >
                    {nft.isOriginalOwner ? 'Your NFT' : 
                     nft.seller.toLowerCase() === walletAddress.toLowerCase() ? 'Withdraw' : 'Purchase'}
                  </Button>
                ]}
              >
                <Card.Meta
                  title={nft.title}
                  description={
                    <div>
                      <div className="text-lg font-bold text-blue-600 mb-2">
                        {nft.price} ETH
                      </div>
                      <div className="text-xs text-gray-500">
                        Seller: {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default NFTList;
