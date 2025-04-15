import React, { useState, useEffect } from 'react';
import { connectWallet, getContract } from '../utils/ethereum';

// Import contract ABIs
import NFTContract from '../../artifacts/contracts/NFT.sol/NFT.json';
import MarketplaceContract from '../../artifacts/contracts/marketplace.sol/Marketplace.json';

// Update with the contract addresses from deployment
const MARKETPLACE_ADDRESS = "0x8ECc9e2E88Ea1c036dC54bb3F77c4E2a869f03f6";
const NFT_ADDRESS = "0x433ea293E9F35F1058d8242d6f094647c115B449";

function ContractInteraction() {
  const [account, setAccount] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [marketContract, setMarketContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState([]);

  const initializeContracts = async () => {
    try {
      setLoading(true);
      const { address, provider } = await connectWallet();
      
      const nftContractInstance = await getContract(NFT_ADDRESS, NFTContract.abi, provider);
      const marketContractInstance = await getContract(MARKETPLACE_ADDRESS, MarketplaceContract.abi, provider);
      
      setAccount(address);
      setNftContract(nftContractInstance);
      setMarketContract(marketContractInstance);
      
      // Load owned NFTs
      const tokens = await nftContractInstance.getTokensOwnedByMe();
      setOwnedNFTs(tokens);
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeContracts();
  }, []);

  const mintNFT = async (tokenURI) => {
    try {
      const tx = await nftContract.mintToken(tokenURI);
      await tx.wait();
      alert('NFT minted successfully!');
    } catch (error) {
      console.error('Error minting NFT:', error);
    }
  };

  const listNFT = async (tokenId, price) => {
    try {
      const listingFee = await marketContract.getListingFee();
      const tx = await marketContract.createMarketItem(
        NFT_ADDRESS,
        tokenId,
        price,
        { value: listingFee }
      );
      await tx.wait();
      alert('NFT listed successfully!');
    } catch (error) {
      console.error('Error listing NFT:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>NFT Marketplace</h2>
      <p>Connected Account: {account}</p>
      
      <div>
        <h3>Mint New NFT</h3>
        <button onClick={() => mintNFT("your_token_uri")}>
          Mint NFT
        </button>
      </div>

      <div>
        <h3>Your NFTs</h3>
        {ownedNFTs.map((tokenId) => (
          <div key={tokenId.toString()}>
            <p>Token ID: {tokenId.toString()}</p>
            <button onClick={() => listNFT(tokenId, "1000000000000000000")}>
              List for 1 ETH
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContractInteraction; 