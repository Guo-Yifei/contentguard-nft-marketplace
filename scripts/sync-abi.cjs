const fs = require("fs");
const path = require("path");

// 源文件路径
const NFT_SOURCE = path.join(
  __dirname,
  "../artifacts/contracts/NFT.sol/NFT.json"
);
const MARKETPLACE_SOURCE = path.join(
  __dirname,
  "../artifacts/contracts/marketplace.sol/Marketplace.json"
);

// 目标文件路径
const FRONTEND_CONTRACTS_DIR = path.join(__dirname, "../src/contracts");
const NFT_TARGET = path.join(FRONTEND_CONTRACTS_DIR, "NFT.json");
const MARKETPLACE_TARGET = path.join(
  FRONTEND_CONTRACTS_DIR,
  "Marketplace.json"
);

// 确保目标目录存在
if (!fs.existsSync(FRONTEND_CONTRACTS_DIR)) {
  fs.mkdirSync(FRONTEND_CONTRACTS_DIR, { recursive: true });
}

// 复制 ABI 文件
function copyABI(source, target) {
  try {
    const contract = require(source);
    // 只保留 ABI 部分
    const abiOnly = {
      abi: contract.abi,
      contractName: contract.contractName,
    };
    fs.writeFileSync(target, JSON.stringify(abiOnly, null, 2));
    console.log(`Successfully copied ABI to ${target}`);
  } catch (error) {
    console.error(`Error copying ABI from ${source}:`, error);
  }
}

// 执行复制
copyABI(NFT_SOURCE, NFT_TARGET);
copyABI(MARKETPLACE_SOURCE, MARKETPLACE_TARGET);
