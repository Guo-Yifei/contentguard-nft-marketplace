import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs, getDoc } from 'firebase/firestore';
import { updateNFTOwner } from './nftService';

// 创建购买请求
export const createPurchaseRequest = async (nftId, buyerAddress, sellerAddress, price) => {
  try {
    const transactionDoc = {
      nftId,
      buyer: buyerAddress,
      seller: sellerAddress,
      price,
      status: 'pending', // pending, approved, rejected, completed
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'transactions'), transactionDoc);
    return { id: docRef.id, ...transactionDoc };
  } catch (error) {
    console.error('Error creating purchase request:', error);
    throw error;
  }
};

// 更新交易状态
export const updateTransactionStatus = async (transactionId, status) => {
  try {
    const transactionRef = doc(db, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

// 获取用户的待处理交易
export const getPendingTransactions = async (userAddress) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('seller', '==', userAddress),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    throw error;
  }
};

// 获取用户的所有相关交易（作为买家或卖家）
export const getUserTransactions = async (userAddress) => {
  try {
    const buyerQuery = query(
      collection(db, 'transactions'),
      where('buyer', '==', userAddress)
    );
    
    const sellerQuery = query(
      collection(db, 'transactions'),
      where('seller', '==', userAddress)
    );
    
    const [buyerSnapshot, sellerSnapshot] = await Promise.all([
      getDocs(buyerQuery),
      getDocs(sellerQuery)
    ]);

    const buyerTransactions = buyerSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      role: 'buyer'
    }));

    const sellerTransactions = sellerSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      role: 'seller'
    }));

    return [...buyerTransactions, ...sellerTransactions];
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
};

// 更新交易状态并处理所有权转移
export const handleTransaction = async (transactionId, approved) => {
  try {
    // 获取交易详情
    const transactionRef = doc(db, 'transactions', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    const transaction = transactionDoc.data();

    // 更新交易状态
    await updateDoc(transactionRef, {
      status: approved ? 'completed' : 'rejected',
      updatedAt: serverTimestamp()
    });

    // 如果批准，转移NFT所有权
    if (approved) {
      await updateNFTOwner(transaction.nftId, transaction.buyer);
    }

    return true;
  } catch (error) {
    console.error('Error handling transaction:', error);
    throw error;
  }
}; 