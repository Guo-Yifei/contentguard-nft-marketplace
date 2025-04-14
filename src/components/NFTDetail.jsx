import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // For accessing route params
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';  // Firestore methods for fetching data
import { db } from '../firebase/config';  // Your Firebase configuration
import { Spin } from 'antd';  // To show a loading spinner while fetching data
import PurchaseButton from './PurchaseButton';

const NFTDetail = () => {
  const { id } = useParams();
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

  if (loading) {
    // Show a loading spinner until the data is fetched
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Filter the NFTs based on the id from the route params
  const filteredNfts = nfts.filter(nft => nft.id === id);

  if (filteredNfts.length === 0) {
    // If no NFT matches the given ID, show an error message
    return <div>No NFT found with this ID.</div>;
  }

  return (
    <div>
      {filteredNfts.map((nft) => (
        <div key={nft.id} className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">{nft.title}</h1>
          <img
            src={nft.imageUrl || '/placeholder.png'}  // Display the image
            alt={nft.title}
            style={{
              width: '500px',
              height: '500px',
              objectFit: 'cover',
            }}
          />
          <div style={{ textAlign: 'left' }}>
            <h4 className="text-lg font-bold mt-4">Price: {nft.price} ETH</h4>
            <h4 className="text-lg font-bold mt-2">Owner: {nft.owner}</h4>
            <p className="text-md mt-2">{nft.description}</p>
          </div>
          <PurchaseButton
            nft={nft}
            buyerAddress={localStorage.getItem('walletAddress')}
          />
          {/* Add any additional NFT details */}
          <div>
            <h5 className="text-sm mt-2">Created At: {new Date(nft.createdAt.seconds * 1000).toLocaleDateString()}</h5>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NFTDetail;

