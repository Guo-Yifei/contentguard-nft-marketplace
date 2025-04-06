import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';

export const createNFT = async (nftData, imageBase64, walletAddress) => {
  try {
    // 创建NFT文档
    const nftDoc = {
      title: nftData.title,
      description: nftData.description,
      price: nftData.price,
      imageUrl: imageBase64,  // 直接存储base64字符串
      creator: walletAddress,
      owner: walletAddress,
      createdAt: serverTimestamp(),
      status: 'active'
    };

    // 保存到Firestore
    const docRef = await addDoc(collection(db, 'nfts'), nftDoc);
    return { id: docRef.id, ...nftDoc };
  } catch (error) {
    console.error('Error creating NFT:', error);
    throw error;
  }
};

// 更新NFT所有者
export const updateNFTOwner = async (nftId, newOwner) => {
  try {
    const nftRef = doc(db, 'nfts', nftId);
    await updateDoc(nftRef, {
      owner: newOwner
    });
  } catch (error) {
    console.error('Error updating NFT owner:', error);
    throw error;
  }
}; 