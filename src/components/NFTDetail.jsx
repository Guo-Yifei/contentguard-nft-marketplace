import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Card, Button, Row, Col, Timeline, Typography, Divider } from 'antd';
import { ShoppingCartOutlined, HistoryOutlined, WalletOutlined, TagOutlined, StopOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/config.js';
import MARKETPLACE_ABI from '../contracts/Marketplace.json';
import NFT_ABI from '../contracts/NFT.json';
import { message } from 'antd';

const { Title, Text } = Typography;
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const NFTDetail = () => {
  const { id } = useParams();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [marketItemId, setMarketItemId] = useState(null);
  const [price, setPrice] = useState(null);
  const [ownershipHistory, setOwnershipHistory] = useState([]);
  const [timelineHeight, setTimelineHeight] = useState(0);

  useEffect(() => {
    loadNFT();
  }, [id]);

  useEffect(() => {
    const adjustTimelineHeight = () => {
      const nftCard = document.querySelector('.nft-card');
      if (nftCard) {
        setTimelineHeight(nftCard.offsetHeight);
      }
    };

    // Initial adjustment
    adjustTimelineHeight();
    
    // Adjust on window resize
    window.addEventListener('resize', adjustTimelineHeight);
    
    // Adjust after a short delay to ensure content is loaded
    const timer = setTimeout(adjustTimelineHeight, 100);
    
    return () => {
      window.removeEventListener('resize', adjustTimelineHeight);
      clearTimeout(timer);
    };
  }, [nft]); // Re-run when NFT data changes

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
      const httpURI = tokenURI.replace('ipfs://', IPFS_GATEWAY);
      const metadataResponse = await fetch(httpURI);
      const metadata = await metadataResponse.json();

      // Convert image URL if it's IPFS
      const imageUrl = metadata.image.startsWith('ipfs://') 
        ? metadata.image.replace('ipfs://', IPFS_GATEWAY)
        : metadata.image;

      // Get both transfer and marketplace events
      const transferFilter = nftContract.filters.Transfer(null, null, id);
      const transferEvents = await nftContract.queryFilter(transferFilter);
      
      // Get marketplace events
      const marketItemCreatedFilter = marketplaceContract.filters.MarketItemCreated(null, null, id);
      const marketItemCreatedEvents = await marketplaceContract.queryFilter(marketItemCreatedFilter);

      // Get current market items to determine status
      const marketItems = await marketplaceContract.fetchAvailableMarketItems();
      const currentMarketItem = marketItems.find(item => 
        item.tokenId.toString() === id.toString() && 
        !item.sold && 
        !item.canceled
      );

      if (currentMarketItem) {
        setMarketItemId(currentMarketItem.marketItemId);
        setPrice(ethers.formatEther(currentMarketItem.price));
      }

      // Combine all events and sort by timestamp
      const allEvents = await Promise.all([
        ...transferEvents.map(async (event) => {
          const block = await event.getBlock();
          // Check if this is a withdrawal (transfer from marketplace to original owner)
          const isWithdrawal = event.args[0].toLowerCase() === CONTRACT_ADDRESSES.sepolia.marketplace.toLowerCase() &&
                             event.args[1].toLowerCase() === owner.toLowerCase();
          
          // Check if this is a listing (transfer to marketplace)
          const isListing = event.args[1].toLowerCase() === CONTRACT_ADDRESSES.sepolia.marketplace.toLowerCase();
          
          return {
            type: isWithdrawal ? 'withdrawn' : 
                  isListing ? 'listed' :
                  event.args[0] === ethers.ZeroAddress ? 'mint' : 'transfer',
            from: event.args[0],
            to: event.args[1],
            timestamp: block.timestamp * 1000,
            price: null
          };
        }),
        ...marketItemCreatedEvents.map(async (event) => {
          const block = await event.getBlock();
          const marketItem = await marketplaceContract.fetchAvailableMarketItems();
          const currentItem = marketItem.find(item => 
            item.tokenId.toString() === id.toString() && 
            item.marketItemId.toString() === event.args.marketItemId.toString()
          );

          // Check if this is the most recent event for this market item
          const isMostRecent = !marketItem.some(item => 
            item.tokenId.toString() === id.toString() && 
            item.marketItemId.toString() === event.args.marketItemId.toString() &&
            item.sold
          );

          if (currentItem?.canceled) {
            return {
              type: 'withdrawn',
              from: currentItem.seller,
              timestamp: block.timestamp * 1000,
              price: ethers.formatEther(currentItem.price)
            };
          } else if (currentItem?.sold) {
            return {
              type: 'purchased',
              from: currentItem.seller,
              to: currentItem.owner,
              timestamp: block.timestamp * 1000,
              price: ethers.formatEther(currentItem.price)
            };
          } else if (isMostRecent) {
            return {
              type: 'listed',
              from: event.args.seller,
              timestamp: block.timestamp * 1000,
              price: ethers.formatEther(event.args.price)
            };
          }

          return null; // Skip this event if it's not the most recent
        })
      ]);

      // Filter out null events and sort by timestamp
      const sortedEvents = allEvents
        .filter(event => event !== null)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      console.log('Ownership History Events:', sortedEvents); // Debug log
      setOwnershipHistory(sortedEvents);

      // Determine if user is the original owner
      const isOriginalOwner = owner.toLowerCase() === currentWalletAddress.toLowerCase();
      const isListed = !!currentMarketItem;
      const isSeller = currentMarketItem?.seller.toLowerCase() === currentWalletAddress.toLowerCase();

      setNft({
        tokenId: id,
        title: metadata.name,
        description: metadata.description,
        imageUrl: imageUrl,
        owner: owner,
        marketItemId: currentMarketItem?.marketItemId,
        price: currentMarketItem ? ethers.formatEther(currentMarketItem.price) : null,
        isOriginalOwner,
        isListed,
        isSeller
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

  const handleListForSale = async () => {
    try {
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

      // Get listing fee
      const listingFee = await marketplaceContract.getListingFee();

      // Approve marketplace to handle NFT
      const approveTx = await nftContract.approve(
        CONTRACT_ADDRESSES.sepolia.marketplace,
        id
      );
      await approveTx.wait();

      // List NFT on marketplace
      const priceInWei = ethers.parseEther('0.01'); // Default price
      const listTx = await marketplaceContract.createMarketItem(
        CONTRACT_ADDRESSES.sepolia.nft,
        id,
        priceInWei,
        { value: listingFee }
      );
      await listTx.wait();

      message.success('NFT listed for sale successfully!');
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error listing NFT:', error);
      message.error('Failed to list NFT: ' + error.message);
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

  const isDisabled = nft.isOriginalOwner || !nft.isListed || nft.isSeller;

  return (
    <div className="container mx-auto p-6 h-screen" style={{marginTop: '15px'}}>
      <Row gutter={[32, 32]} className="h-full">
        <Col xs={24} md={12} className="h-full">
          <Card className="h-full nft-card">
            <div style={{ 
              height: 'calc(100% - 200px)', 
              overflow: 'hidden',
              borderRadius: '12px'
            }}>
              <img
                src={nft.imageUrl || '/placeholder.png'}
                alt={nft.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.png';
                }}
              />
            </div>
            <Card.Meta
              title={<Title level={2}>{nft.title}</Title>}
              description={
                <div className="space-y-4">
                  <Text>{nft.description}</Text>
                  {price && (
                    <div className="text-xl font-bold text-blue-600">
                      Price: {price} ETH
                    </div>
                  )}
                  <div className="flex items-center space-x-2" style={{marginTop: '15px'}}>
                    <WalletOutlined />
                    <Text type="secondary" style={{marginLeft: '10px'}}>
                      Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                    </Text>
                  </div>
                </div>
              }
            />
            <div className="mt-6" style={{marginTop: '15px'}}>
              {!nft.isListed && nft.isOriginalOwner ? (
                <Button
                  type="primary"
                  icon={<TagOutlined />}
                  onClick={handleListForSale}
                  size="large"
                  block
                >
                  List for Sale
                </Button>
              ) : (
                <Button
                  type={isDisabled ? 'default' : 'primary'}
                  icon={<ShoppingCartOutlined />}
                  onClick={isDisabled ? handleWithdraw : handlePurchase}
                  disabled={!marketItemId}
                  size="large"
                  block
                >
                  {!marketItemId ? 'Not Listed for Sale' : 
                   isDisabled ? 'Withdraw' : 'Purchase'}
                </Button>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} className="h-full">
          <Card 
            title={<><HistoryOutlined /> Ownership History</>} 
            style={{ height: '100%' }}
            className="h-full"
          >
            <div style={{ 
              height: 'calc(100% - 60px)', 
              overflowY: 'auto',
              padding: '8px 16px',
              maxHeight: 'calc(100vh - 200px)'
            }}>
              <Timeline
                items={ownershipHistory.map((event, index) => {
                  console.log('Rendering event:', event); // Debug log
                  return {
                    color: index === 0 ? 'blue' : 'gray',
                    dot: event.type === 'listed' ? <TagOutlined /> :
                         event.type === 'purchased' ? <ShoppingCartOutlined /> :
                         event.type === 'withdrawn' ? <StopOutlined /> :
                         event.type === 'mint' ? <WalletOutlined /> :
                         <HistoryOutlined />,
                    children: (
                      <div key={index} className="flex items-start">
                        <span 
                          style={{
                            fontWeight: 'bold',
                            marginRight: '8px',
                            minWidth: '120px',
                            color: event.type === 'mint' ? '#ca8a04' :
                                   event.type === 'purchased' ? '#16a34a' :
                                   event.type === 'listed' ? '#2563eb' :
                                   event.type === 'withdrawn' ? '#dc2626' :
                                   '#4b5563'
                          }}
                        >
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </span>
                        <div>
                          {event.type !== 'withdrawn' && event.from && (
                            <div className="text-sm text-gray-500">
                              From: {event.from === ethers.ZeroAddress ? 'Minted' : 
                                `${event.from.slice(0, 6)}...${event.from.slice(-4)}`}
                            </div>
                          )}
                          {event.to && (
                            <div className="text-sm text-gray-500">
                              To: {`${event.to.slice(0, 6)}...${event.to.slice(-4)}`}
                            </div>
                          )}
                          {event.price && (
                            <div className="text-sm text-blue-500">
                              Price: {event.price} ETH
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  };
                })}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NFTDetail;

