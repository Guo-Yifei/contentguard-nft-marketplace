import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // For accessing route params
import { doc, getDoc } from 'firebase/firestore';  // Firestore methods for fetching data
import { db } from '../firebase/config';  // Your Firebase configuration
import { Spin } from 'antd';  // To show a loading spinner while fetching data

const NFTDetail = () => {
  const { id } = useParams();  // Get the NFT id from the URL
  const [nft, setNft] = useState(null);  // State to hold NFT data
  const [loading, setLoading] = useState(true);  // Loading state

  useEffect(() => {
    loadNFTDetails();
  }, [id]);  // Run the function when the `id` changes (e.g., when navigating)

  // Function to fetch NFT details from Firestore
  const loadNFTDetails = async () => {
    try {
      const docRef = doc(db, 'nfts', id);  // Create reference to the document using `id`
      const docSnap = await getDoc(docRef);  // Fetch the document
      if (docSnap.exists()) {
        setNft(docSnap.data());  // Set NFT data if it exists
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching NFT details:', error);  // Handle errors
    } finally {
      setLoading(false);  // Set loading to false once data is fetched
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

  if (!nft) {
    // If NFT doesn't exist, show an error message
    return <div>No NFT found with this ID.</div>;
  }

  return (
    <div className="container mx-auto p-6">
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
      <div style={{textAlign:'left'}}>
        <h4 className="text-lg font-bold mt-4">Price: {nft.price} ETH</h4>
        <h4 className="text-lg font-bold mt-2">Owner: {nft.owner}</h4>
        <p className="text-md mt-2">{nft.description}</p>
      </div>
      {/* Add any additional NFT details */}
      <div>
        <h5 className="text-sm mt-2">Created At: {new Date(nft.createdAt.seconds * 1000).toLocaleDateString()}</h5>
      </div>
    </div>
  );
};

export default NFTDetail;
