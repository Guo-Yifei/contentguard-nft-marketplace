import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Spin, Input, Button, Modal, message } from 'antd';
import { EyeOutlined, TagOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/config.js';
import MARKETPLACE_ABI from '../contracts/Marketplace.json';
import NFT_ABI from '../contracts/NFT.json';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const MyAssets = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [listPrice, setListPrice] = useState('');
  const [isListing, setIsListing] = useState(false);

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

      // Get all NFTs owned by the user
      const tokenIds = await nftContract.getTokensOwnedByMe({ from: currentWalletAddress });
      console.log('Owned token IDs:', tokenIds);
      
      // Get metadata for each NFT
      const ownedNFTs = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await nftContract.tokenURI(tokenId);
            // Convert IPFS URI to HTTP URL
            const httpURI = tokenURI.replace('ipfs://', IPFS_GATEWAY);
            const metadataResponse = await fetch(httpURI);
            const metadata = await metadataResponse.json();

            // Convert image URL if it's IPFS
            const imageUrl = metadata.image.startsWith('ipfs://') 
              ? metadata.image.replace('ipfs://', IPFS_GATEWAY)
              : metadata.image;

            // Check if NFT is already listed on marketplace
            const marketItems = await marketplaceContract.fetchAvailableMarketItems();
            console.log('Market items:', marketItems);
            
            const marketItem = marketItems.find(item => {
              const isMatch = item.tokenId.toString() === tokenId.toString() && 
                !item.sold && 
                !item.canceled;
              console.log(`Checking token ${tokenId}:`, {
                marketItemTokenId: item.tokenId.toString(),
                isMatch,
                isSold: item.sold,
                isCanceled: item.canceled
              });
              return isMatch;
            });

            console.log(`Token ${tokenId} market item:`, marketItem);

            return {
              tokenId: tokenId.toString(),
              title: metadata.name,
              description: metadata.description,
              imageUrl: imageUrl,
              isListed: !!marketItem,
              marketItemId: marketItem?.marketItemId,
              price: marketItem ? ethers.formatEther(marketItem.price) : null,
              owner: marketItem?.owner,
              isDisabled: marketItem?.owner.toLowerCase() === currentWalletAddress.toLowerCase() || !marketItem?.marketItemId
            };
          } catch (error) {
            console.error(`Error loading metadata for token ${tokenId}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed metadata fetches
      const validNFTs = ownedNFTs.filter(nft => nft !== null);
      console.log('Valid NFTs:', validNFTs);
      setNfts(validNFTs);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      message.error('Failed to load NFTs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleListForSale = (nft) => {
    setSelectedNFT(nft);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedNFT(null);
    setListPrice('');
  };

  const handleList = async () => {
    try {
      if (!selectedNFT || !listPrice) return;

      setIsListing(true);
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize contracts
      const marketplaceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.marketplace,
        MARKETPLACE_ABI.abi,
        signer
      );

      const nftContract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.nft,
        NFT_ABI.abi,
        signer
      );

      // Approve marketplace to handle NFT
      const approveTx = await nftContract.approve(
        CONTRACT_ADDRESSES.sepolia.marketplace,
        selectedNFT.tokenId
      );
      await approveTx.wait();

      // List NFT on marketplace
      const priceInWei = ethers.parseEther(listPrice);
      const listTx = await marketplaceContract.createMarketItem(
        CONTRACT_ADDRESSES.sepolia.nft,
        selectedNFT.tokenId,
        priceInWei,
        { value: priceInWei }
      );
      await listTx.wait();

      message.success('NFT listed for sale successfully!');
      handleCancel();
      loadNFTs(); // Refresh the list
    } catch (error) {
      console.error('Error listing NFT:', error);
      message.error('Failed to list NFT: ' + error.message);
    } finally {
      setIsListing(false);
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
      <h1 className="text-3xl font-bold mb-8">My NFTs</h1>
      {nfts.length === 0 ? (
        <div className="text-center text-xl mt-8">
          You don't own any NFTs yet.
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
                    type="primary"
                    icon={<TagOutlined />}
                    onClick={() => handleListForSale(nft)}
                    key="list"
                  >
                    List
                  </Button>
                ]}
              >
                <Card.Meta
                  title={nft.title}
                  description={
                    <div>
                      {nft.isListed && (
                        <div className="text-lg font-bold text-blue-600 mb-2">
                          Listed for: {nft.price} ETH
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Token ID: #{nft.tokenId}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="List NFT for Sale"
        open={isModalVisible}
        onOk={handleList}
        onCancel={handleCancel}
        confirmLoading={isListing}
      >
        <div className="mb-4">
          <p className="mb-2">Enter the price in ETH:</p>
          <Input
            type="number"
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            placeholder="0.01"
            min="0.000000000000000001"
            step="0.000000000000000001"
          />
        </div>
      </Modal>
    </div>
  );
};

export default MyAssets; 