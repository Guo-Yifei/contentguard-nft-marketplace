const hre = require("hardhat");
const dotenv = require("dotenv");
const fs = require("fs");

function replaceEnvContractAddresses(marketplaceAddress, nftAddress) {
  const envFileName = ".env";
  const envFile = fs.readFileSync(envFileName, "utf-8");
  const env = dotenv.parse(envFile);
  env.MARKETPLACE_CONTRACT_ADDRESS_SEPOLIA = marketplaceAddress;
  env.NFT_CONTRACT_ADDRESS_SEPOLIA = nftAddress;
  const newEnv = Object.entries(env).reduce((env, [key, value]) => {
    return `${env}${key}=${value}\n`;
  }, "");

  fs.writeFileSync(envFileName, newEnv);
}

async function main() {
  console.log("Starting deployment...");

  // 部署 Marketplace 合约
  console.log("Deploying Marketplace contract...");
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);

  // 部署 NFT 合约
  console.log("Deploying NFT contract...");
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(marketplaceAddress);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("NFT deployed to:", nftAddress);

  // 更新环境变量
  console.log("Updating .env file with contract addresses...");
  replaceEnvContractAddresses(marketplaceAddress, nftAddress);

  // 验证合约（仅在测试网上）
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [],
      });
      console.log("Marketplace contract verified successfully");
    } catch (error) {
      console.log("Error verifying Marketplace contract:", error);
    }

    try {
      await hre.run("verify:verify", {
        address: nftAddress,
        constructorArguments: [marketplaceAddress],
      });
      console.log("NFT contract verified successfully");
    } catch (error) {
      console.log("Error verifying NFT contract:", error);
    }
  }

  console.log("Deployment completed!");
  console.log("Marketplace address:", marketplaceAddress);
  console.log("NFT address:", nftAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });