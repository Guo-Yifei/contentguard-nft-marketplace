import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

export const connectWallet = async () => {
  try {
    const provider = await detectEthereumProvider();
    
    if (!provider) {
      throw new Error('Please install MetaMask!');
    }

    // Request account access
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    
    // Create Web3Provider instance
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    
    return {
      address: accounts[0],
      provider: ethersProvider
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const getContract = async (contractAddress, contractABI, provider) => {
  try {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    return contract;
  } catch (error) {
    console.error('Error getting contract:', error);
    throw error;
  }
}; 