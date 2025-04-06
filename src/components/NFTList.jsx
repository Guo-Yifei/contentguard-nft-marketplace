import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map(nft => (
          <div key={nft.id} className="border rounded-lg overflow-hidden shadow-lg bg-white w-full h-[400px] flex flex-col">
            {/* 图片容器 - 更小的固定高度 */}
            <div className="h-[200px] w-full overflow-hidden">
              <img 
                src={nft.imageUrl} 
                alt={nft.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.png';
                  e.target.onerror = null;
                }}
              />
            </div>
            {/* NFT信息 - 剩余空间 */}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1 truncate" title={nft.title}>
                  {nft.title}
                </h2>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2" title={nft.description}>
                  {nft.description}
                </p>
              </div>
              <div>
                <p className="text-lg font-bold mb-2">{nft.price} ETH</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                  </span>
                  <PurchaseButton 
                    nft={nft} 
                    buyerAddress={localStorage.getItem('walletAddress')}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTList; 