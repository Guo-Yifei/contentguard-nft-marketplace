import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "../contracts/config.js";
import NFT_ABI from "../contracts/NFT.json";
import MARKETPLACE_ABI from "../contracts/Marketplace.json";

// Web3
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const nftContract = new ethers.Contract(
  CONTRACT_ADDRESSES.sepolia.nft,
  NFT_ABI.abi,
  signer
);

const marketplaceContract = new ethers.Contract(
  CONTRACT_ADDRESSES.sepolia.marketplace,
  MARKETPLACE_ABI.abi,
  signer
);

export const createNFT = async (nftData, imageBase64, walletAddress) => {
  try {
    // Step 1: Save to Firestore
    const nftDoc = {
      title: nftData.title,
      description: nftData.description,
      price: nftData.price,
      imageUrl: imageBase64,
      creator: walletAddress,
      owner: walletAddress,
      createdAt: serverTimestamp(),
      status: 'active',
    };
    const docRef = await addDoc(collection(db, 'nfts'), nftDoc);

    // Step 2: Mint NFT on-chain
    const mintTx = await nftContract.mintToken(imageBase64);
    const receipt = await mintTx.wait();
    const event = receipt.events.find((e) => e.event === "TokenMinted");
    const tokenId = event.args.tokenId.toString();

    // Step 3: List NFT for sale
    const listingFee = await marketplaceContract.getListingFee();
    const tx = await marketplaceContract.createMarketItem(
      CONTRACT_ADDRESSES.sepolia.nft,
      tokenId,
      ethers.utils.parseEther(nftData.price.toString()),
      { value: listingFee }
    );
    await tx.wait();

    return { id: docRef.id, ...nftDoc, tokenId };
  } catch (error) {
    console.error('Error creating NFT:', error);
    throw error;
  }
};

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
