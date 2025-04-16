import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "../contracts/config.js";
import NFT_ABI from "../contracts/NFT.json";
import MARKETPLACE_ABI from "../contracts/Marketplace.json";

// 初始化合约
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

// 调用示例
async function mintNFT(tokenURI) {
  const tx = await nftContract.mintToken(tokenURI);
  await tx.wait();
  return tx;
}

async function createMarketItem(tokenId, price) {
  const listingFee = await marketplaceContract.getListingFee();
  const tx = await marketplaceContract.createMarketItem(
    CONTRACT_ADDRESSES.sepolia.nft,
    tokenId,
    ethers.utils.parseEther(price),
    { value: listingFee }
  );
  await tx.wait();
  return tx;
}

export { mintNFT, createMarketItem, nftContract, marketplaceContract };
