import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "../contracts/config.js";
import NFT_ABI from "../contracts/NFT.json";
import MARKETPLACE_ABI from "../contracts/Marketplace.json";

let provider;
let signer;
let nftContract;
let marketplaceContract;

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia testnet chain ID

// Function to convert base64 to blob
const base64ToBlob = (base64, type = 'application/octet-stream') => {
  const binStr = atob(base64.split(',')[1]);
  const len = binStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }
  return new Blob([arr], { type });
};

export const initializeWeb3 = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please connect your MetaMask account.');
    }

    // Check current network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== SEPOLIA_CHAIN_ID) {
      try {
        // Request to switch to Sepolia network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Test Network',
                  rpcUrls: ['https://rpc.sepolia.org'],
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                },
              ],
            });
          } catch (addError) {
            throw new Error('Failed to add Sepolia network to MetaMask');
          }
        } else {
          throw new Error('Failed to switch to Sepolia network');
        }
      }
    }

    // Initialize provider and signer with the new ethers.js API
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    nftContract = new ethers.Contract(
      CONTRACT_ADDRESSES.sepolia.nft,
      NFT_ABI.abi,
      signer
    );

    marketplaceContract = new ethers.Contract(
      CONTRACT_ADDRESSES.sepolia.marketplace,
      MARKETPLACE_ABI.abi,
      signer
    );

    // Store the connected wallet address
    const address = await signer.getAddress();
    localStorage.setItem('walletAddress', address);

    return { provider, signer, nftContract, marketplaceContract };
  } catch (error) {
    console.error('Error initializing Web3:', error);
    throw new Error(error.message || 'Failed to initialize Web3. Please make sure MetaMask is connected and you are on the correct network.');
  }
};

export const createNFT = async (nftData, imageBase64, walletAddress) => {
  try {
    // Ensure Web3 is initialized
    if (!nftContract || !marketplaceContract) {
      await initializeWeb3();
    }

    // Step 1: Upload image to IPFS
    const imageBlob = base64ToBlob(imageBase64);
    const formData = new FormData();
    formData.append('file', imageBlob);

    const ipfsResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
      },
      body: formData
    });

    if (!ipfsResponse.ok) {
      throw new Error('Failed to upload image to IPFS');
    }

    const ipfsData = await ipfsResponse.json();
    const imageHash = ipfsData.IpfsHash;

    // Step 2: Create and upload metadata JSON
    const metadata = {
      name: nftData.title,
      description: nftData.description,
      image: `https://ipfs.io/ipfs/${imageHash}`,
      external_url: `https://ipfs.io/ipfs/${imageHash}`,
      attributes: [
        {
          trait_type: "Creator",
          value: walletAddress
        },
        {
          trait_type: "Price",
          value: nftData.price.toString()
        }
      ]
    };

    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFormData = new FormData();
    metadataFormData.append('file', metadataBlob, 'metadata.json');

    const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
      },
      body: metadataFormData
    });

    if (!metadataResponse.ok) {
      throw new Error('Failed to upload metadata to IPFS');
    }

    const metadataIpfsData = await metadataResponse.json();
    const metadataHash = metadataIpfsData.IpfsHash;

    // Step 3: Save to Firestore
    const nftDoc = {
      title: nftData.title,
      description: nftData.description,
      price: nftData.price,
      imageUrl: `https://ipfs.io/ipfs/${imageHash}`,
      imageHash: imageHash,
      metadataUrl: `https://ipfs.io/ipfs/${metadataHash}`,
      metadataHash: metadataHash,
      creator: walletAddress,
      owner: walletAddress,
      createdAt: serverTimestamp(),
      status: 'active',
    };
    const docRef = await addDoc(collection(db, 'nfts'), nftDoc);

    try {
      // Step 4: Mint NFT with metadata URI
      const mintTx = await nftContract.mintToken(`https://ipfs.io/ipfs/${metadataHash}`);
      const mintReceipt = await mintTx.wait();
      
      // Get the token ID from the mint event
      const event = mintReceipt.logs.find(log => log.fragment && log.fragment.name === 'TokenMinted');
      if (!event) {
        throw new Error('TokenMinted event not found');
      }
      const tokenId = event.args[0].toString();
      
      // Update Firestore with mint transaction hash and token ID
      await updateDoc(docRef, {
        mintTransactionHash: mintReceipt.hash,
        tokenId: tokenId,
        status: 'minted'
      });

      return { 
        id: docRef.id, 
        ...nftDoc, 
        tokenId: tokenId,
        mintTransactionHash: mintReceipt.hash
      };
    } catch (error) {
      // If on-chain transaction fails, update Firestore status
      await updateDoc(docRef, {
        status: 'failed',
        error: error.message
      });
      throw error;
    }
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

// New function to list NFT on marketplace
export const listNFT = async (tokenId, price) => {
  try {
    if (!nftContract || !marketplaceContract) {
      await initializeWeb3();
    }

    // Convert price to wei
    const priceInWei = ethers.parseEther(price.toString());
    
    // Get listing fee
    const listingFee = await marketplaceContract.getListingFee();
    
    // Approve marketplace to handle the NFT
    const approveTx = await nftContract.approve(
      CONTRACT_ADDRESSES.sepolia.marketplace,
      tokenId
    );
    await approveTx.wait();
    
    // Create the market item
    const listTx = await marketplaceContract.createMarketItem(
      CONTRACT_ADDRESSES.sepolia.nft,
      tokenId,
      priceInWei,
      { value: listingFee }
    );
    
    const listReceipt = await listTx.wait();
    
    // Update Firestore with listing transaction hash
    const nftRef = doc(db, 'nfts', tokenId);
    await updateDoc(nftRef, {
      listTransactionHash: listReceipt.hash,
      status: 'listed'
    });

    return listReceipt.hash;
  } catch (error) {
    console.error('Error listing NFT:', error);
    throw error;
  }
};
