const hre = require("hardhat");

async function main() {
  // Deploy Marketplace first
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed to:", await marketplace.getAddress());

  // Deploy NFT with marketplace address
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(await marketplace.getAddress());
  await nft.waitForDeployment();
  console.log("NFT deployed to:", await nft.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 