import React, { useState, useEffect } from 'react';
import { createPurchaseRequest } from '../services/transactionService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const PurchaseButton = ({ nft, buyerAddress }) => {
  const [loading, setLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // 检查是否存在待处理的购买请求
  useEffect(() => {
    const checkPendingRequest = async () => {
      try {
        const q = query(
          collection(db, 'transactions'),
          where('nftId', '==', nft.id),
          where('buyer', '==', buyerAddress),
          where('status', '==', 'pending')
        );
        
        const querySnapshot = await getDocs(q);
        setHasPendingRequest(!querySnapshot.empty);
      } catch (error) {
        console.error('Error checking pending request:', error);
      }
    };

    checkPendingRequest();
  }, [nft.id, buyerAddress]);

  const handlePurchaseRequest = async () => {
    setLoading(true);
    try {
      await createPurchaseRequest(
        nft.id,
        buyerAddress,
        nft.owner,
        nft.price
      );
      setHasPendingRequest(true);
      alert('Purchase request sent successfully!');
    } catch (error) {
      alert('Error sending purchase request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 如果是NFT拥有者或已有待处理请求，则禁用按钮
  const isDisabled = loading || nft.owner === buyerAddress || hasPendingRequest;

  return (
    <button
      onClick={handlePurchaseRequest}
      disabled={isDisabled}
      className={`px-4 py-2 rounded ${
        isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white`}
    >
      {loading ? 'Sending Request...' : 
       hasPendingRequest ? 'Request Pending' : 
       nft.owner === buyerAddress ? 'You Own This' : 
       'Purchase'}
    </button>
  );
};

export default PurchaseButton; 