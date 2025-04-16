import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button } from 'antd';

const MyAssets = () => {
  const [nfts, setNfts] = useState([]);
  const walletAddress = localStorage.getItem('walletAddress')
  const filteredNfts = nfts.filter(nft => nft.owner === walletAddress);
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
      <h1 className="text-3xl font-bold mb-8">My Assets</h1>
      <Row gutter={[24, 24]}>
        {filteredNfts.map((nft) => (
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
                </div>
              </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MyAssets; 