import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import PurchaseButton from './PurchaseButton';

const NFTList = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'nfts'));
      const nftList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNfts(nftList);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="text-xl">Loading NFTs...</div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">NFT Marketplace</h1>
      <Row gutter={[24, 24]}>
        {nfts.map((nft) => (
          <Col span={8} key={nft.id}>
              <Card
                hoverable
                style={{
                  margin: '30px',
                }}
              >
                <Link to={`/nft/${nft.id}`}>
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
                    Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                  </span>
                  <PurchaseButton
                    nft={nft}
                    buyerAddress={localStorage.getItem('walletAddress')}
                  />
                </div>
              </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default NFTList;
